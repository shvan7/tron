import state from './state.js'
import { SIZE, CASE_SIZE as S } from './config.js'
import h from './izi/h.js'
const names = Object.create(null)
const canvas = h.canvas({ width: `${SIZE * S}`, height: `${SIZE * S}`})
const ctx = canvas.getContext('2d')
const createCaseEl = h.style({
  height: `${S}px`,
  width: `${S}px`,
})

const memo = fn => (c => a => c[a] || (c[a] = fn(a)))(Object.create(null))
const toHex = memo(color => '#'+ `00000${color.toString(16)}`.slice(-6))
const draw = rect => {
  rect.drawCount++
  ctx.fillStyle = toHex(rect.color)
  ctx.fillRect(rect.x * S, rect.y * S, S, S)
}

Object.assign(document.body.style, {
  margin: 0,
  background: '#111',
})

const translate = (x, y) => `translate(${~~(x * S)}px, ${~~(y * S)}px)`

let fadingRects = []
const _padNumber = n => ` #${n}`.slice(-3)
const _pad = str => `${str}        `.slice(0, 10)
const getRank = (i, players, length) =>
  _padNumber(players.length - (length - (i + 1)))
const isFading = rect => rect.drawCount < 128

const fadeTrail = () => {
  fadingRects = fadingRects.filter(isFading)
  fadingRects.forEach(draw)
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

export default {
  init: (mapState, genMapFrom, players) => {
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, SIZE * S, SIZE * S)
    h.replaceContent(document.body, h.div.style({
      display: 'flex',
      fontFamily: 'monospace',
      flexWrap: 'wrap',
      position: 'relative',
      margin: '0 0 0 auto',
      width: `${S * SIZE}px`,
    }, players.map(({ name, x, y, color }) => names[name] = h.div.style({
      position: 'absolute',
      left: 0,
      top: 0,
      transform: translate(x, y),
      transition: 'transform 0.1s',
      whiteSpace: 'pre',
      color: toHex(color),
      opacity: 1,
      background: 'rgba(0, 0, 0, 0.25)',
      textShadow: [
        '-1px -1px black',
        '-1px 1px black',
        '1px -1px black',
        '1px 1px black',
      ].join(', m')
    }, name)).concat([
      canvas,
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
      el.style.position = 'fixed'
    }),
  update: nextMoves => {
    nextMoves.forEach(rect => {
      const r = { x: rect.x, y: rect.y, drawCount: 0, color: rect.color }
      draw(r)
      //fadingRects.push(r)
      rect.dead || (names[rect.name].style.transform = translate(rect.x, rect.y))
    })
    //fadeTrail()
  },
  end: () => setInterval(fadeTrail, 16),
}

