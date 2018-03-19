const randomRate = Math.random()
let _m = 0x80000000
let _a = 1103515245
let _c = 12345
let _seed = Math.floor(randomRate * (_m-1))

const nextInt = () => _seed = (_a * _seed + _c) % _m
const nextFloat = () => nextInt() / (_m - 1)
const nextRange = (start, end) =>
  start + Math.floor(nextInt() / _m * end - start)

export default Object.assign(nextFloat, {
  seed: rate => {
    if (!rate) return _seed
    return _seed = rate < 1
      ? Math.floor((rate || randomRate) * (_m-1))
      : _seed = rate
  },
  pick: arr => arr[nextRange(0, arr.length)],
  float: nextFloat,
  range: nextRange,
  int: nextInt,
})
