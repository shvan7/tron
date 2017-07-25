const { SIZE, CASE_SIZE: S } = require('./config')
const h = require('izi/h')
const names = Object.create(null)
let stage, renderer
const createCaseEl = h.style({
  height: `${S}px`,
  width: `${S}px`,
})

Object.assign(document.body.style, {
  margin: 0,
  background: 'darkgrey',
})

const translate = (x, y) => `translate(${~~(x * S)}px, ${~~(y * S)}px)`

let fadingRects = []
const _padNumber = n => ` #${n}`.slice(-3)
const _pad = str => `${str}      `.slice(0, 8)
const getRank = (i, players, length) =>
  _padNumber(players.length - (length - (i + 1)))
const isFading = rect => rect.alpha <= 1
const fade = rect => rect.alpha += 0.0075
const fadeTrail = () => {
  fadingRects = fadingRects.filter(isFading)
  fadingRects.forEach(fade)
}

module.exports = {
  init: (mapState, genMapFrom, players) => {
    renderer = PIXI.autoDetectRenderer(S * SIZE, S * SIZE)
    stage = new PIXI.Container()
    h.replaceContent(document.body, h.div.style({
      display: 'flex',
      flexWrap: 'wrap',
      position: 'relative',
      margin: '0 auto',
      width: `${S * SIZE}px`,
    }, players.map(({ name, x, y }) => names[name] = h.div.style({
      position: 'absolute',
      left: 0,
      top: 0,
      transform: translate(x, y),
      transition: 'transform 0.1s',
      whiteSpace: 'pre',
      color: 'white',
      opacity: 1,
      fontFamily: 'monospace',
      textShadow: [
        '-1px -1px black',
        '-1px 1px black',
        '1px -1px black',
        '1px 1px black',
      ].join(', m')
    }, name)).concat([ renderer.view ])))

    renderer.render(stage)
    return mapState
  },
  setScore: players => players
    .filter(p => p.dead)
    .sort((a, b) => b.score === a.score
      ? a.name - b.name
      : b.score - a.score)
    .forEach(({ name, x, y, cause, score }, i, { length }) => {
      const el = names[name]
      el.textContent = `${getRank(i, players, length)} - ${_pad(name)} (${score})`
      el.style.transition = 'transform 0.5s ease-in, opacity 5s ease-out'
      el.style.transform = translate(0, i * 2)
      if (i > 2) {
        el.style.opacity = 0.1 + ((length - i) / players.length) / 2.5
      }
    }),
  update: nextMoves => {
    nextMoves.forEach(({ name, x, y, color, dead }) => {
      //const { style } = map[y][x]

      const rect = new PIXI.Graphics()
      rect.beginFill(color)
      rect.alpha = 0.3
      rect.drawRect(x * S, y * S, S, S)
      rect.endFill()
      stage.addChild(rect)
      fadingRects.push(rect)
      dead || (names[name].style.transform = translate(x, y))
    })
    fadeTrail()
    renderer.render(stage)
  },
  end: () => {
    setInterval(() => {
      fadeTrail()
      renderer.render(stage)
    }, 16)
  }
}

