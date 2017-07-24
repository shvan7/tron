SIZE  //available size of the map

// here you can setup any functions you will use in your final solve function
const directions = [
  { x: 0, y: -1 }, // up
  { x: 1, y: 0 },  // right
  { x: 0, y: 1 },  // down
  { x: -1, y: 0 }, // left
]

const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)]
const getRandomFreeSlot = (getPos, isFree) => pickRandom(directions
  .map(getPos)
  .filter(isFree))


// you should return a function that is called with those 4 tools functions
// and your player object
return ({ isFree, getDist, reduceMap, getPos }) => {

  return getRandomFreeSlot(getPos, isFree) || 'up'
}