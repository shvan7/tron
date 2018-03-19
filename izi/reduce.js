
import iter from './iter.js'
import { isFn } from './is.js'

const reduce = iter.magic('accumulator')
reduce.from = (fn, acc) => isFn(acc)
  ? collection => reduce(fn, collection, acc())
  : collection => reduce(fn, collection, acc)

export default reduce
