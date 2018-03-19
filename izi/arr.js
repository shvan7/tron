const range = (start, end) => {
  if (end === undefined) {
    end = start
    start = 0
  }
  const max = end - start
  const ret = Array(max)
  let i = -1

  while (++i <= max) {
    ret[i] = start + i
  }
  return ret
}
range.from = n => end => range(n, end)

const proto = Object.getOwnPropertyNames(Array.prototype)
  .filter(method => typeof Array.prototype[method] === 'function')
  .reduce((acc, method) => {
    const fn = Array.prototype[method]
    acc[method] = function() { return arr => fn.apply(arr, arguments) }
    return acc
  }, {})

const remove = (arr, elem) => {
  if (!arr) return arr
  const idx = arr.indexOf(elem)
  if (idx < 0) return arr
  arr.splice(idx, 1)
  return arr
}

const shuffle = arr => {
  let i = arr.length
  let j, tmp
  while (--i > 0) {
    j = Math.floor(Math.random() * (i + 1))
    tmp = arr[j]
    arr[j] = arr[i]
    arr[i] = tmp
  }
  return arr
}
const n = n => arr => arr[n]
const first = arr => arr[0]
const append = (arr, value) => arr ? (arr.push(value), arr) : [ value ]
const prepend = (arr, value) => arr ? (arr.unshift(value), arr) : [ value ]
const last = arr => arr[arr.length - 1]
const unique = arr => Array.from(new Set(arr))
const random = arr => arr[Math.floor(Math.random() * arr.length)]
const inRange = (arr, idx) => Math.min(Math.max(idx, 0), arr.length - 1)

export {
  range,
  remove,
  shuffle,
  proto,
  first,
  append,
  prepend,
  last,
  unique,
  random,
  inRange,
}

