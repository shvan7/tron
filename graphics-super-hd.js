const state = require('./state')
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
const _pad = str => `${str}        `.slice(0, 10)
const getRank = (i, players, length) =>
  _padNumber(players.length - (length - (i + 1)))
const isFading = rect => rect.alpha <= 1
const fade = rect => rect.alpha += 0.0075
const fadeTrail = () => {
  fadingRects = fadingRects.filter(isFading)
  fadingRects.forEach(fade)
}

const ctrlBtn = h('button.ctrl-btn', {
  style: {
    border: 'none',
    padding: '8px',
    width: '30px',
    height: '30px',
    outline: 0,
    backgroundColor: 'transparent',
    color: 'white',
  }
})

const pauseBtn = ctrlBtn({
  onclick: () => state.paused.set(!state.paused()),
  title: 'space to pause',
}, state.paused() ? '▷' : '❘❘')

state.paused(paused => pauseBtn.textContent = paused ? '▷' : '❘❘')

const reloadBtn = ctrlBtn({
  onclick: () => state.shouldReload.set(true),
  title: 'r to reload',
}, '↺')

const speedDisplay = h.span.style({
  border: 'none',
  display: 'inline-block',
  boxSizing: 'border-box',
  whiteSpace: 'nowrap',
  padding: '8px',
  width: '100px',
  height: '30px',
  outline: 0,
  backgroundColor: 'transparent',
  color: 'white',
}, `speed x${state.speedFactor()}`)

state.speedFactor(speedFactor => speedDisplay.textContent = `speed x${state.speedFactor()}`)


module.exports = {
  init: (mapState, genMapFrom, players) => {
    renderer || (renderer = PIXI.autoDetectRenderer(S * SIZE, S * SIZE))
    stage = new PIXI.Container()
    h.replaceContent(document.body, h.div.style({
      display: 'flex',
      fontFamily: 'monospace',
      flexWrap: 'wrap',
      position: 'relative',
      margin: '0 auto',
      width: `${S * SIZE}px`,
    }, players.map(({ name, x, y, color }) => names[name] = h.div.style({
      position: 'absolute',
      left: 0,
      top: 0,
      transform: translate(x, y),
      transition: 'transform 0.1s',
      whiteSpace: 'pre',
      color: '#'+ `00000${color.toString(16)}`.slice(-6),
      opacity: 1,
      background: 'rgba(0, 0, 0, 0.25)',
      textShadow: [
        '-1px -1px black',
        '-1px 1px black',
        '1px -1px black',
        '1px 1px black',
      ].join(', m')
    }, name)).concat([
      renderer.view,
      // control bar
      h.div.style({
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      }, [
        speedDisplay,
        pauseBtn,
        reloadBtn,
      ])
    ])))

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
    }),
  update: nextMoves => {
    nextMoves.forEach(({ name, x, y, color, dead }) => {
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

