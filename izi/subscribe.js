import { remove } from './arr.js'

export default (listeners, fn, value) => {
  if (typeof fn !== 'function') return value
  listeners.push(fn)
  return () => listeners && remove(listeners, fn)
}
