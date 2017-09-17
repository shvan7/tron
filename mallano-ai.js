SIZE  //available size of the map

let danger = 0
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
// and the players array
// a player is an object such as
// {
//   name,
//   score,
//   dead, // boolean
//   x,
//   y,
// }

return ({ isFree, getDist, reduceMap, getPos, players }) => {

  const myPos = getPos()
  
  const up = getPos({ y: -1 })
  const left = getPos({ x: -1 })
  const down = getPos({ y: +1 })
  const right = getPos({ x: +1 })

  const upPlusUn = getPos({ y: -2 })
  const leftPlusUn = getPos({ x: -2 })
  const downPlusUn = getPos({ y: +2 })
  const rightPlusUn = getPos({ x: +2 })

//   méthode basique

//const availablePositions = directions.map(getPos).filter(isFree)   // les deux c'est pareil en gros
/*
const wesh = () => {
  if (isFree(up)) {
     return (up)
  } else if (isFree(left)) {
    return left
  } else if (isFree(down)) {
    return down
  } else if (isFree(right)) {
    return right
  }
}
*/

//    méthode de la tortue v1

const turtleMod = () => {
  if (isFree(up) && isFree(left) && isFree(right) && isFree(down)) {
    return up
  }
  if (!isFree(down) && isFree(left)) {
    return left
  }
  if (!isFree(right) && isFree(down)) {
    return down
  }
  if (isFree(right) && !isFree(up)) {
    return right
  }
  if (!isFree(left) && isFree(up)) {
    return up
  }
}

//    méthode nice start (en cours)

const niceStart = () => {
  if ((myPos.x < 50)) {
    if (myPos.y < 50) {
      if (myPos.x < myPos.y) {
        return left
      }

      return up
    }
    if (myPos.x < (100 - myPos.y)) {
      return left
    }

    return down
  }

  if ((myPos.x >= 50)) {
    if (myPos.y < 50) {
      if ((100 - myPos.x) < myPos.y) {
        return right
      }

      return up
    }
    if ((100 - myPos.x) < (100 - myPos.y)) {
      return right
    }

    return down
  }
}

if (!isFree(up) && !isFree(right)) {
  danger = 1
}
if (!isFree(up) && !isFree(down)) {
  danger = 1
}
if (!isFree(up) && !isFree(left)) {
  danger = 1
}
if (!isFree(right) && !isFree(down)) {
  danger = 1
}
if (!isFree(right) && !isFree(left)) {
  danger = 1
}
if (!isFree(down) && !isFree(left)) {
  danger = 1
}

if (danger === 1) {
  return turtleMod()
}

return niceStart()

}
