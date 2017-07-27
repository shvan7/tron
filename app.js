const graphic = require('./graphics-super-hd')
const hslToRgb = require('./hsl-to-rgb')
const rseed = require('./rseed')
const { shuffle } = require('izi/arr')
const { js } = require('izi/inject')
const routeParams = require('./router')
const cdnBaseUrl = 'https://cdnjs.cloudflare.com/ajax/libs'
const { SIZE, DIR } = require('./config')
const PI4 = Math.PI / 4
const sget = (key, src) => src && (src[key] || (src[key] = Object.create(null)))
const sort = fn => arr => arr.slice(0).sort(fn)
const noOp = () => {}
sort.byScore = sort((a,b) => a.score - b.score)

const tryCatch = (fn, ...args) => { try { return fn(...args) } catch(err) { return err } }
const reduceMap = (fn, acc) => {
  let x = -1, y
  while (++x < SIZE) {
    y = -1
    while (++y < SIZE) {
      acc = fn(x, y, acc)
    }
  }
  return acc
}

Math.random = rseed.float
rseed.seed(routeParams.seed)

const emptyTile = Object.freeze({ color: 'black', name: 'empty' })
const notInBounds = n => n >= SIZE || n < 0
const inBounds = n => n < SIZE && n >= 0
const genMapFrom = (fn = noOp) => reduceMap((x, y, map) => {
  (map[x] || (map[x] = Array(SIZE)))[y] = fn(x, y)
  return map
}, Array(SIZE))

const players = []
const playerNames = Object.create(null)
const state = {
  players,
  map: [],
}

const getMap = () => state.map[state.map.length - 1]
const start = () => {}

// get the manathan distance between 2 points
const dist = (a, b) => Math.abs(a - b)
const getDist = (a, b) => dist(a.x, b.x) + dist(a.y, b.y)
const getName = p => p.name
const getPlayerNames = () => players.map(getName)
const addPlayer = name => {
  console.log('fetching: ', name)

  let indexedName = name
  if (playerNames[name]) {
    const regex = new RegExp(`^${name}(\d+)?`)
    const len = getPlayerNames().filter(n => regex.test(n)).length
    indexedName = `${name}${len > 0 ? len + 1 : ''}`
  }
  const player = playerNames[indexedName] = {
    name: indexedName,
    color: 'purple',
    dead: false,
    score: 0,
    load:
      fetch(`https://thot.space/${name}/tron/raw/master/ai.js?${Math.random()}`)
      //fetch(`/cdenis.js`)
      .then(res => res.status === 200
        ? res.text()
        : Promise.reject(Error(`Error: ${res.status} - ${res.statusText}`)))
      .then(fnBody => {
        const fn = (new Function([ 'SIZE' ], fnBody))(SIZE)
        if (typeof fn !== 'function') {
          throw Error('ai.js should return a function')
        }
        try {
          player.ai = mapState => fn({
            getPos: ({ x: x = 0, y: y = 0 } = {}) => ({
              x: player.x + x,
              y: player.y + y,
            }),
            isFree: ({ x, y }) => inBounds(x)
              && inBounds(y)
              && mapState[x][y] === emptyTile,
            getDist,
            reduceMap,
          })
        } catch(err) {
          return err
        }
      }).catch(err => {
        console.error('Unable to load player AI', err.message)
        player.ai = () => ({})
      }),
//    load: Promise.resolve(),
  }

  players.push(player)
}

//const calculatePosition = () =>

const killPlayer = p => {
  console.log(`${p.name} died because he ${p.cause} at ${p.x} ${p.y}`)
  p.dead = true
  graphic.setScore(players)
}

/*
getTile(x, y)
forEachTile( { x, y, content:  } )
*/

const gameOver = () => {
  graphic.end()
  console.log('game over', sort.byScore(players))
}

const livingPlayers = player => !player.dead
window.players = players
const addPos = (a, b) => ({ x: a.x + b.x, y: a.y + b.y })
const clamp1 = (a, b) => Math.sign(a) + b
const getAngle = (a, b) => Math.atan2(b.y - a.y, b.x - a.x)
const _0 = n => n < 10 ? `0${n}` : String(n)
const pad = str => `        ${str}`.slice(-8)
const update = () => {
  const nextMove = Object.create(null)
  const map = state.map[state.map.length - 1]

  players
    .filter(livingPlayers)
    .map(player => {
      const aiRet = tryCatch(player.ai, map)
      if (aiRet instanceof Error) {
        return { error: aiRet, player }
      }
      const dir = aiRet && (typeof aiRet === 'object')
        ? aiRet
        : addPos(player, DIR[aiRet] || { x: 0, y: 0})

      if (!dir) {
        console.log(player.name, 'returned an invalid direction', aiRet)
      }

      const { x: x = 0, y: y = 0 } =  dir || {}
      let pos = { x, y }
      if (player.px === pos.x && player.py === y) {
        player.positionList = []

      } else {
        player.px = x
        player.py = y
        if (getDist(pos, player) > 1) {
          const angle = getAngle(player, pos)
          console.log({
            angle,
            x1: player.x,
            y1: player.y,
            x2: pos.x,
            y2: pos.y,
          })

          if (angle > PI4 && angle <= (3 * PI4)) {
            pos = addPos(player, DIR.down)
          } else if (angle > (PI4 * 3) && angle <= 5 * PI4) {
            pos = addPos(player, DIR.left)
          } else if (angle > (5 * PI4) && angle <= 7 * PI4) {
            pos = addPos(player, DIR.up)
          } else {
            pos = addPos(player, DIR.right)
          }
        }
      }
      pos.player = player

      return pos
    })
    .filter(({ player, x, y, error }, _, calculatedMoves) => {
      if (error) {
        console.error(error)
        return player.cause = `AI error: ${error.message}`
      }
      const pos = { x, y }
      if (calculatedMoves.some(move =>
          move.player !== player && move.x === x && move.y === y)) {
        return player.cause = 'moved to the same position of another player'
      }
      if (notInBounds(x) || notInBounds(y)) {
        return player.cause = 'went out of bounds'
      }

      if (map[x][y] !== emptyTile) {
        return player.cause = 'crashed on' + map[x][y].name
      }

      player.x = x
      player.y = y
      player.score++
      (nextMove[x] || (nextMove[x] = Object.create(null)))[y] = player
      return false
    }).forEach(({ player }) => killPlayer(player))

  const generatedMap = genMapFrom((x, y) =>
    (nextMove[x] && nextMove[x][y]) !== undefined
      ? nextMove[x][y]
      : map[x][y])

  state.map.push(generatedMap)
  graphic.update(players)

  if (Object.keys(nextMove).length) {
    setTimeout(() => requestAnimationFrame(update), 0)
  } else {
    gameOver()
  }
}

window.update = update

const empty = () => emptyTile
const initPlayerData = nextMapState => {
  const angle = (Math.PI * 2) / players.length
  const rate = (100 / players.length / 100)
  players.forEach((player, i) => {
    player.color = hslToRgb(i * rate, 1, 0.4)
    const x = Math.round(Math.cos(angle * i) * (SIZE / 2 * 0.8) + (SIZE / 2))
    const y = Math.round(Math.sin(angle * i) * (SIZE / 2 * 0.8) + (SIZE / 2))
    player.x = x
    player.y = y
    // player.index = nextMapState[x][y] = i
  })
}

const prepareNewGame = () => Promise.all(players
  .map(p => p.load)
  .concat([ js(`${cdnBaseUrl}/pixi.js/4.5.1/pixi.min.js`) ]))
.then(() => {
  const nextMapState = genMapFrom(empty)

  state.map.length = 0
  state.map.push(nextMapState)

  initPlayerData(nextMapState)
  graphic.init(nextMapState, genMapFrom, players)
  update()
})

shuffle(routeParams.users.sort()).forEach(addPlayer)
prepareNewGame()

/*

/**/
