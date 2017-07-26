SIZE  //available size of the map

let isFree, getDist, reduceMap, getPos

// here you can setup any functions you will use in your final solve function
const directions = [
  { key: 'up',    x:  0, y: -1 },
  { key: 'right', x:  1, y:  0 },
  { key: 'down',  x:  0, y:  1 },
  { key: 'left',  x: -1, y:  0 },
]
const D = directions

const UP    = 0
const RIGHT = 1
const DOWN  = 2
const LEFT  = 3

const log = (...args) => console.log("ycribier ~>", ...args)

const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)]
const getRandomFreeSlot = (getPos, isFree) => pickRandom(directions
  .map(getPos)
  .filter(isFree))


let currentDirection = UP
let isReverse = false

const snail = () => {
  if (isFree(getPos(D[(currentDirection + 1) % 4]))) {
    currentDirection = (currentDirection + 1) % 4
  }

  if (!isFree(getPos(D[(currentDirection)]))) {
    log('reverseSnail')
    isReverse = true
    return reverseSnail()
  }

  return directions[currentDirection].key
}

const reverseSnail = () => {
  const dir = (currentDirection - 1) < 0 ? 3 : currentDirection - 1
  if (isFree(getPos(D[dir]))) {
    currentDirection = dir
  }

  if (!isFree(getPos(D[(currentDirection)]))) {
    log('snail')
    isReverse = false
    return snail()
  }

  return directions[currentDirection].key
}

// you should return a function that is called with those 4 tools functions
// and your player object
return (e) => {

  isFree = e.isFree // isFree({x: 0, y: 0})
  getDist = e.getDist // reduceMap((x, y, acc) => {})
  reduceMap = e.reduceMap // getDist({x,y}, {x,y})
  getPos = e.getPos // getPos() -> {x, y}

  return isReverse ? reverseSnail() : snail()
}
