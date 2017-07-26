SIZE  //available size of the map

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

const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)]
const getRandomFreeSlot = (getPos, isFree) => pickRandom(directions
  .map(getPos)
  .filter(isFree))


let radius = 1
let currentDirection = UP

const snail = () => {
  if (isFree(getPos(D[ (currentDirection + 1) % 4 ]))) {
    currentDirection = (currentDirection + 1) % 4
  }
  return directions[currentDirection].key
}

// you should return a function that is called with those 4 tools functions
// and your player object
return ({ isFree, getDist, reduceMap, getPos }) => {

  // isFree({x: 0, y: 0})
  // reduceMap((x, y, acc) => {})
  // getDist({x,y}, {x,y})
  // getPos() -> {x, y}

  return snail()

  switch (currentDirection) {

  case UP:
    if (isFree(getPos(D[RIGHT]))) {
      currentDirection = RIGHT
      return 'right'
    }
    return 'up'


  case RIGHT:
    if (isFree(getPos(D[DOWN]))) {
      currentDirection = DOWN
      return 'down'
    }
    return 'right'


  case DOWN:
    if (isFree(getPos(D[LEFT]))) {
      currentDirection = LEFT
      return 'left'
    }
    return 'down'


  case LEFT:
    if (isFree(getPos(D[UP]))) {
      currentDirection = UP
      return 'up'
    }
    return 'left'

  }

  return getRandomFreeSlot(getPos, isFree) || 'up'
}
