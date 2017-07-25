const { SIZE, CASE_SIZE: S } = require('./config')
const h = require('izi/h')
let map, stage, renderer
const createCaseEl = h.style({
  height: `${S}px`,
  width: `${S}px`,
})

Object.assign(document.body.style, {
  margin: 0,
  background: 'darkgrey',
})

const translate = (x, y) =>
  `translate(${~~(x * S)}px, ${~~(y * S)}px)`

let fadingRects = []
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
    map = {}
    /*
    map = genMapFrom((x, y) => {
    })
  */
    h.replaceContent(document.body, h.div.style({
      display: 'flex',
      flexWrap: 'wrap',
      position: 'relative',
      margin: '0 auto',
      width: `${S * SIZE}px`,
    }, [ renderer.view ].concat(players.map(({ name, x, y }) => map[name] = h.div.style({
      position: 'absolute',
      left: 0,
      top: 0,
      transform: translate(x, y),
      transition: 'transform 0.1s',
      color: 'white',
      fontFamily: 'monospace',
      textShadow: [
        '-1px -1px black',
        '-1px 1px black',
        '1px -1px black',
        '1px 1px black',
      ].join(', m')
    }, name)))))

    renderer.render(stage)
    return mapState
  },
  update: nextMoves => {
    nextMoves.forEach(({ name, x, y, color }) => {
      //const { style } = map[y][x]

      const rect = new PIXI.Graphics()
      rect.beginFill(color)
      rect.alpha = 0.3
      rect.drawRect(x * S, y * S, S, S)
      rect.endFill()
      stage.addChild(rect)
      fadingRects.push(rect)
      map[name].style.transform = translate(x, y)
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

