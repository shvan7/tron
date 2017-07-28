const observable = require('izi/emiter/observ')

const reset = () => {
  module.exports.players.forEach(p => p.dead = false)
  module.exports.map.length = 0
}

module.exports = {
  players: [],
  map: [],
  paused: observable.check(true),
  shouldReload: observable.check(false),
  reset,
}
