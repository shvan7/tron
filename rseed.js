const randomRate = Math.random()
let _m = 0x80000000
let _a = 1103515245
let _c = 12345
let _seed = Math.floor(randomRate * (_m-1))

const nextInt = () => _seed = (_a * _seed + _c) % _m
const nextFloat = () => nextInt() / (_m - 1)
const nextRange = (start, end) =>
  start + Math.floor(nextInt() / _m * end - start)

module.exports = Object.assign(nextFloat, {
  seed: rate => {
    _seed = Math.floor((rate || randomRate) * (_m-1))
    return rate ? rate : randomRate
  },
  pick: arr => arr[nextRange(0, arr.length)],
  float: nextFloat,
  range: nextRange,
  int: nextInt,
})
