const observable = require('izi/emiter/observ')

const defaults = {
  speedFactor: 8,
}
const players = []
const map = []
const speedFactor = observable.check(defaults.speedFactor)
const speedFactorBounds = [0.25, 32]

const decSpeed = () => speedFactor.set(Math.max(speedFactor() / 2, speedFactorBounds[0]))
const incSpeed = () => speedFactor.set(Math.min(speedFactor() * 2, speedFactorBounds[1]))

const reset = () => {
  players.forEach(p => {
    p.dead = false
    p.score = 0
  })
  map.length = 0
}

module.exports = {
  players,
  map,
  paused: observable.check(true),
  speedFactor,
  incSpeed,
  decSpeed,
  shouldReload: observable.check(false),
  reset,
}
