import state from './state.js'
import h from './izi/h.js'
import { isNum } from './izi/is.js'
import graphic from './graphics-super-hd.js'
import { shuffle } from './izi/arr.js'
import keyHandler from './izi/key-handler.js'
import hslToRgb from './hsl-to-rgb.js'
import rseed from './rseed.js'
import aiLoader from './ai-loader.js'
import { SIZE, DIR } from './config.js'

const PI4 = Math.PI / 4
const sget = (key, src) => src && (src[key] || (src[key] = Object.create(null)))
const sort = fn => arr => arr.slice(0).sort(fn)
const noOp = () => {}
sort.byScore = sort((a,b) => a.score - b.score)

const tryCatch = (fn, ...args) => {
  try { return fn(...args) }
  catch(err) { return err }
}

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

const rnd = Math.random
Math.random = rseed.float

const emptyTile = Object.freeze({ color: 'black', name: 'empty' })
const notInBounds = n => n >= SIZE || n < 0
const inBounds = n => n < SIZE && n >= 0
const genMapFrom = (fn = noOp) => reduceMap((x, y, map) => {
  (map[x] || (map[x] = Array(SIZE)))[y] = fn(x, y)
  return map
}, Array(SIZE))

const players = state.players
const playerNames = Object.create(null)

window.state = state

const getMap = () => state.map
const start = () => {}

// get the manathan distance between 2 points
const dist = (a, b) => Math.abs(a - b)
const getDist = (a, b) => dist(a.x, b.x) + dist(a.y, b.y)
const getName = p => p.name
const getPlayerNames = () => players.map(getName)
const isPlayerDead = p => p.dead
const computePlayer = ({ name, dead, x, y }, id) =>
  `{"name":"${name}","dead":${dead},"x":${x},"y":${y},"id":${id + 1}}`

const addPlayer = async name => {
  console.log('fetching: ', name)

  let id = name
  if (playerNames[name]) {
    const regex = new RegExp(`^${name}(\d+)?`)
    const len = getPlayerNames().filter(n => regex.test(n)).length
    id = `${name}${len > 0 ? len + 1 : ''}`
  }
  const player = playerNames[id] = {
    name: id,
    color: 'purple',
    dead: false,
    score: 0,
    load: aiLoader({ name, id, seed: state.seed() })
      .then(ai => player.ai = ai)
      .catch(err => player.ai = () => Promise.reject(err)),
  }

  players.push(player)

  return player
}

const killPlayer = (p, cause, x = p.x, y = p.y) => {
  console.log(`${p.name} died because he ${cause} at ${x} ${y}`)
  p.cause = cause
  p.dead = true
  graphic.setScore(players)
}

const gameOver = () => {
  graphic.end()
  console.log('game over', sort.byScore(players))
}

const livingPlayers = player => !player.dead
const getAngle = (a, b) => Math.atan2(b.y - a.y, b.x - a.x)
const _0 = n => n < 10 ? `0${n}` : String(n)
const pad = str => `        ${str}`.slice(-8)
let updateId = 0
let timeoutId = 0
const cancelUpdate = () => {
  cancelAnimationFrame(updateId)
  clearTimeout(timeoutId)
}

const stringifyTile = tile => tile === emptyTile ? 0 : 1
const stringifyRow = line => line.map(stringifyTile)
const update = async () => {
  const nextMove = Object.create(null)
  const seed = rseed.seed()
  const jsonMap = `{
    "players": [${players.map(computePlayer)}],
    "state": [${state.map.map(stringifyRow)}]
  }`
  // new SharedArrayBuffer(1024)

  const playersLeft = players.filter(livingPlayers)
  if (!playersLeft.length) {
    clearTimeout(timeoutId)
    return gameOver()
  }
  if (state.paused()) {
    clearTimeout(timeoutId)
    return timeoutId = setTimeout(update, 50)
  }
  await Promise.all(playersLeft.map(player => player.ai(jsonMap)
    .then(({ data }) => {
      const { x, y } = JSON.parse(data)
      if (!isNum(x) || !isNum(y)) {
        throw Error('Bad AI return value, expect { x, y } got '+ data)
      }
      if (notInBounds(x) || notInBounds(y)) {
        return killPlayer(player, 'moved out of the map', x, y)
      }
      const { x: px, y: py } = player
      if (!(x === (px - 1) && y === py)
        && !(x === (px + 1) && y === py)
        && !(x === px && py === (y + 1))
        && !(x === px && py === (y - 1))) {
        return killPlayer(player, `tried to teleport`, x, y)
      }
      if (state.map[x][y] !== emptyTile) {
        return killPlayer(player, `crashed on ${state.map[x][y].name}`, x, y)
      }
      player.x = x
      player.y = y
      player.score++
      state.map[x][y] = player
      graphic.update(players)
    })
    .catch(err => {
      console.error(err.message)
      killPlayer(player, 'of an AI error')
    })))
/*
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      cancelAnimationFrame(updateId)
      updateId = requestAnimationFrame(update)
    }, ((32 / ) - 1) * 10)
    */
  clearTimeout(timeoutId)
  return timeoutId = setTimeout(update, 50)
}

state.paused(paused => paused ? cancelUpdate() : update())

window.onkeydown = keyHandler({
  space: () => state.paused.set(!state.paused()),
  s: () => {
    state.seed.set(rnd())
    state.shouldReload.set(true)
  },
  r: e => (e.metaKey || e.ctrlKey) ? false : state.shouldReload.set(true),
  right: {
    shift: () => Array(10).fill().forEach(update),
    none: update,
  },
  up: state.incSpeed,
  down: state.decSpeed,
})

const empty = () => emptyTile
const max = m => n => n > m ? max1(n - m) : n
const max1 = max(1)
const max2PI = max(Math.PI * 2)
const initPlayerData = nextMapState => {
  const angle = (Math.PI * 2) / players.length
  const rate = (100 / players.length / 100)
  const shift = angle * Math.random()
  players.forEach((player, i) => {
    player.color = hslToRgb(max1(i * rate + 0.25), 1, 0.4)
    const x = Math.round(max2PI(Math.cos(angle * i + shift)) * (SIZE / 2 * 0.8) + (SIZE / 2))
    const y = Math.round(max2PI(Math.sin(angle * i + shift)) * (SIZE / 2 * 0.8) + (SIZE / 2))
    player.x = x
    player.y = y
    state.map[x][y] = player
  })
}

const newGame = () => {
  shuffle(players.sort((a, b) => a.name - b.name))

  const nextMapState = genMapFrom(empty)

  state.map = nextMapState

  initPlayerData(nextMapState)
  graphic.init(nextMapState, genMapFrom, players)
  update()
}

const initGame = () => Promise.all(players.map(p => p.load)).then(newGame)

state.shouldReload(shouldReload => {
  console.log('>>> Reloading...')
  cancelUpdate()
  state.reset()
  newGame()
  state.shouldReload.set(false)
})

state.users.forEach(addPlayer)
initGame()
