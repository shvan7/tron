import observable from './izi/observ.js'
import map from './izi/map.js'
import rseed from './rseed.js'
import qs from './izi/query-string.js'

const rnd = Math.random

const setRoute = obj => {
  const newQuery = '?'+ Object.keys(obj)
    .sort()
    .map(key => `${key}=${obj[key]}`)
    .join('&')

  if (newQuery !== location.search) {
    location.search = newQuery
  }
}

const seed = observable(rseed.seed())
seed.set = (setSeed => s => setSeed(rseed.seed(Number(s) || 0)))(seed.set)

const defaults = {
  speedFactor: Number(localStorage.speedFactor) || 32,
  seed: seed(),
  users: [],
}

const urlParams = (parsers => map((val, key) =>
    (parsers[key] || noOp)(val) || defaults[key], qs()))({
  users: u => (u || '').split(',') || [ 'random' ],
  seed: seed.set,
})

const players = []
const history = []
const speedFactor = observable.check(defaults.speedFactor)
const speedFactorBounds = [ 0.25, 32 ]

speedFactor(val => localStorage.speedFactor = val)

const decSpeed = () =>
  speedFactor.set(Math.max(speedFactor() / 2, speedFactorBounds[0]))

const incSpeed = () =>
  speedFactor.set(Math.min(speedFactor() * 2, speedFactorBounds[1]))

setRoute({ seed: seed(), users: urlParams.users.sort() })

export default {
  players,
  seed,
  users: urlParams.users,
  map: history,
  paused: observable.check(true),
  speedFactor,
  incSpeed,
  decSpeed,
  reset: () => setRoute({
    seed: Math.floor(rnd() * 0x80000000),
    users: urlParams.users.sort(),
  }),
  reload: () => location.reload(),
}
