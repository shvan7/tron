import iter from './iter.js'
import magic from './magic.js'

const map = iter.magic('result')
map.toArr = iter.currify(magic('obj', {
  result: 'Array(max)',
  pre: 'result[i] = ',
}))

export default map
