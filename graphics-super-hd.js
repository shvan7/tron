const { SIZE, CASE_SIZE } = require('./config')
const h = require('izi/h')
let map
const createCaseEl = h.style({
  height: `${CASE_SIZE}px`,
  width: `${CASE_SIZE}px`,
})

Object.assign(document.body.style, {
  margin: 0,
  background: 'darkgrey',
})

const translate = (x, y) =>
  `translate(${~~(x * CASE_SIZE)}px, ${~~(y * CASE_SIZE)}px)`

module.exports = {
  init: (mapState, genMapFrom, players) => {
    map = genMapFrom((x, y) =>
      createCaseEl.style({ background: mapState[y][x].color }))

    h.replaceContent(document.body, h.div.style({
      display: 'flex',
      flexWrap: 'wrap',
      position: 'relative',
      margin: '0 auto',
      width: `${CASE_SIZE * SIZE}px`,
    }, map.concat(players.map(({ name, x, y }) => map[name] = h.div.style({
      position: 'absolute',
      left: 0,
      top: 0,
      transform: translate(x, y),
      transition: 'transform 0.5s',
      color: 'white',
      fontFamily: 'monospace',
      textShadow: [
        '-1px -1px black',
        '-1px 1px black',
        '1px -1px black',
        '1px 1px black',
      ].join(', m')
    }, name)))))

    return mapState
  },
  update: nextMoves => nextMoves.forEach(({ name, x, y, color }) => {
    const { style } = map[y][x]
    style.background = color
    style.opacity = 0.5
    map[name].style.transform = translate(x, y)
    setTimeout(() => {
      style.transition = 'opacity 3s'
      style.opacity = 1
    }, 16)
  }),
}

