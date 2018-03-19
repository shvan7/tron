const SIZE = 100
const DIR = {
  up:    { x:  0, y: -1 },
  down:  { x:  0, y:  1 },
  left:  { x: -1, y:  0 },
  right: { x:  1, y:  0 },
}

// Bunch of utils function to get you going
const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)]
const notInBounds = n => n >= SIZE || n < 0
const inBounds = n => n < SIZE && n >= 0
const dist = (a, b) => Math.abs(a - b)
const getDist = (a, b) => dist(a.x, b.x) + dist(a.y, b.y)
const isPlayerDead = p => p.dead
const fold = (fn, acc) => {
  // fold call the given function for every block
  // with x, y and an optionnal accumulator (much like reduce)
  let x = -1, y
  while (++x < SIZE) {
    y = -1
    while (++y < SIZE) {
      acc = fn(x, y, acc)
    }
  }
  return acc
}

const directionValues = Object.values(DIR)

const getAvailableDirections = (getPos, isFree) => directionValues
  .map(getPos)
  .filter(isFree)

// TODO: handle the seed
addEventListener('message', event => {
  const { map, players, id } = JSON.parse(event.data)
  console.log({ map, players, id })
  // Ensure we are sending the answer only once
  const moveTo = dir => event._done || (event._done = true, postMessage(dir))

  moveTo(pickRandom(getAvailableDirections(getPos, isFree)) || 'up')
})

// we tell the main thread that the AI is loaded successfully
sendMessage('loaded')
