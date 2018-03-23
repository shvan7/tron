const randomRate = Math.random()
const _m = 0x80000000
const _m1 = _m - 1
let _seed = Math.floor(randomRate * _m1)

const nextInt = () => _seed = (1103515245 * _seed + 12345) % _m
const nextFloat = () => nextInt() / _m1
const nextRange = (start, end) =>
  start + Math.floor(nextInt() / _m * end - start)

export default Object.assign(nextFloat, {
  seed: rate => {
    if (!rate) return _seed
    return _seed = rate < 1
      ? Math.floor((rate || randomRate) * _m1)
      : _seed = rate
  },
  pick: arr => arr[nextRange(0, arr.length)],
  float: nextFloat,
  range: nextRange,
  int: nextInt,
})
