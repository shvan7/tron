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

const sort = fn => arr => arr.slice(0).sort(fn)
sort.byScore = sort((a,b) => a.score - b.score)

const emptyTile = Object.freeze({ color: 'black', name: 'empty' })
const notInBounds = n => n >= SIZE || n < 0
const inBounds = n => n < SIZE && n >= 0

const players = state.players
const playerNames = Object.create(null)
const addPlayer = async name => {
  console.log('initializing worker for:', name)

  let id = name
  if (playerNames[name]) {
    const regex = new RegExp(`^${name}(\d+)?`)
    const len = players.map(p => p.name).filter(n => regex.test(n)).length
    id = `${name}${len > 0 ? len + 1 : ''}`
  }
  const player = playerNames[id] = {
    name: id,
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

const isAlive = player => !player.dead

const isStuck = ({ x, y }) =>
     state.map.get(x, y - 1) !== emptyTile
  && state.map.get(x, y + 1) !== emptyTile
  && state.map.get(x + 1, y) !== emptyTile
  && state.map.get(x - 1, y) !== emptyTile

const computePlayer = ({ x, y, name, coords, score, cardinal, direction }) =>
  ({ x, y, name, coords, score, cardinal, direction })

const calculateCoords = player => {
  const { x, y } = player
  const { cardinal, direction } = player.coords
    .find(coord => coord.x === x && coord.y === y)

  player.coords = [
    { x, y: y - 1, cardinal: 0, direction: (4 - cardinal) % 4 },
    { x: x + 1, y, cardinal: 1, direction: (5 - cardinal) % 4 },
    { x, y: y + 1, cardinal: 2, direction: (6 - cardinal) % 4 },
    { x: x - 1, y, cardinal: 3, direction: (7 - cardinal) % 4 },
  ]

  player.cardinal = cardinal
  player.direction = direction
}

const update = async forced => {
  await update.lock
  clearTimeout(update.timeout)
  const nextMove = Object.create(null)
  const seed = rseed.seed()
  const playersLeft = players.filter(isAlive)

  if (!playersLeft.length) {
    console.log('game over', sort.byScore(players))
    return graphic.end()
  }

  if (!forced && state.paused()) return update.request(50)

  const data = JSON.stringify(playersLeft.map(computePlayer))
  const startTime = performance.now()
  await (update.lock = Promise.all(shuffle(playersLeft).map(player => player.ai(data)
    .then(({ data }) => {
      player.cpuTime = (player.cpuTime || 0) + (performance.now() - startTime)
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
      player.score++
      player.x = x
      player.y = y
      if (state.map.get(x, y) !== emptyTile) {
        return killPlayer(player, `crashed on ${state.map.get(x, y).name}`, x, y)
      }
    })
    .catch(err => {
      const { x, y } = player
      console.log(isStuck(player))
      console.log(x * SIZE + (y - 1))
      console.log(x * SIZE + (y + 1))
      console.log((x + 1) * SIZE + y)
      console.log((x - 1) * SIZE + y)
      killPlayer(player, 'of an AI error')
      console.error(err.message)
    }))))

  // console.log(playersLeft
  //   .sort((a, b) => b.cpuTime - a.cpuTime).map(a => a.cpuTime))

  playersLeft
    .sort((a, b) => b.cpuTime - a.cpuTime)
    .filter(player => playersLeft.some(p => p.name !== player.name
      && p.x === player.x
      && p.y === player.y))
    .forEach(player => killPlayer(player, 'moved at the same spot'))

  playersLeft.forEach(state.map.setAt)

  playersLeft
    .filter(isAlive)
    .filter(isStuck)
    .forEach(player => killPlayer(player, 'is stuck'))

  playersLeft
    .filter(isAlive)
    .forEach(calculateCoords)

  graphic.update(players)
  const diff = performance.now() - startTime
  const delay = ((32 / state.speedFactor()) - 1) * 10 - diff
  return update.request(delay)
}
update.request = delay => update.timeout = setTimeout(update, delay)

state.paused(paused => paused ? clearTimeout(update.timeout) : update())

addEventListener('keydown', keyHandler({
  space: () => state.paused.set(!state.paused()),
  r: e => (e.metaKey || e.ctrlKey) ? false : location.reload(),
  right: () => update(true),
  s: state.reset,
  up: state.incSpeed,
  down: state.decSpeed,
}))

state.users.forEach(addPlayer)

Promise.all(players.map(p => p.load)).then(() => {
  Math.random = rseed.float

  players.sort((a, b) => a.name - b.name)

  state.map = Array(SIZE * SIZE).fill(emptyTile)

  state.map.set = (x, y, value = emptyTile) => inBounds(x)
    && inBounds(y)
    && (state.map[x * SIZE + y] = value)

  state.map.setAt = p => inBounds(p.x)
    && inBounds(p.y)
    && (state.map[p.x * SIZE + p.y] = p)

  state.map.get = (x, y) => inBounds(x)
    && inBounds(y)
    && state.map[x * SIZE + y]

  const max = m => n => n > m ? max1(n - m) : n
  const max1 = max(1)
  const max2PI = max(Math.PI * 2)
  const angle = (Math.PI * 2) / players.length
  const rate = (SIZE / players.length / SIZE)
  const shift = angle * rseed.float()
  const h = SIZE / 2
  const m = h * 0.8

  players.forEach((player, i) => {
    player.cardinal = 0
    player.direction = 0
    player.color = hslToRgb(max1(i * rate + 0.25), 1, 0.5)
  })

  // Shuffle players before calculating coords
  shuffle(players).forEach((player, i) => {
    const x = player.x = Math.round(max2PI(Math.cos(angle * i + shift)) * m + h)
    const y = player.y = Math.round(max2PI(Math.sin(angle * i + shift)) * m + h)
    player.coords = [
      { x, y: y - 1, cardinal: 0, direction: 0 },
      { x: x + 1, y, cardinal: 1, direction: 1 },
      { x, y: y + 1, cardinal: 2, direction: 2 },
      { x: x - 1, y, cardinal: 3, direction: 3 },
    ]
    state.map.setAt(player)
  })
  graphic.init(players)
  update()
})

window.state = state
