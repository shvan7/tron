let _m = 0x80000000
let _a = 1103515245
let _c = 12345
let _seed = Math.floor(0.5 * (_m-1))

const nextInt = () => _seed = (_a * _seed + _c) % _m
const nextFloat = () => nextInt() / (_m - 1)
const nextRange = (start, end) =>
  start + Math.floor(nextInt() / _m * end - start)

module.exports = Object.assign(nextFloat, {
  pick: arr => arr[nextRange(0, arr.length)],
  float: nextFloat,
  range: nextRange,
  int: nextInt,
})
