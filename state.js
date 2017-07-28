const observable = require('izi/emiter/observ')

const resetState = () => {
  module.exports.players.length = 0
  module.exports.map.length = 0
}

module.exports = {
  players: [],
  map: [],
  paused: observable.check(true),
  resetState,
}
