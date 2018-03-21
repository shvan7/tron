import qs from './izi/query-string.js'

let skip
const updateRoute = obj => {
  skip = true
  window.location.hash = '?'+ Object.keys(obj)
    .sort()
    .map(key => `${key}=${obj[key]}`)
    .join('&')
}

window.addEventListener('hashchange', () => skip
  ? (skip = false)
  : window.location.reload(1))

export default {
  get: qs,
  set: updateRoute,
}
