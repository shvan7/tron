const SIZE = 100
const inBounds = n => n < SIZE && n >= 0
const isInBounds = ({ x, y }) => inBounds(x) && inBounds(y)

const update = ({ state, players, id }) => {
  const player = players.find(p => p.name === id)
  const U = { x: player.x + 1, y: player.y }
  const D = { x: player.x - 1, y: player.y }
  const L = { x: player.x, y: player.y - 1 }
  const R = { x: player.x, y: player.y + 1 }

  const availableDirections = [ U, D, L, R ]
    .filter(isInBounds)
    .filter(({ x, y }) => state[x * SIZE + y] === 0)
  return availableDirections[Math.floor(Math.random() * availableDirections.length)]
}


addEventListener('message', self.init = initEvent => {
  const { seed, id } = JSON.parse(initEvent.data)

  let _seed = seed // Use seeded random for replayable games
  const _m = 0x80000000
  Math.random = () => (_seed = (1103515245 * _seed + 12345) % _m) / (_m - 1)

  removeEventListener('message', self.init)
  addEventListener('message', ({ data }) =>
    postMessage(JSON.stringify(update({ id, ...JSON.parse(data) }))))
  postMessage('loaded')
})
