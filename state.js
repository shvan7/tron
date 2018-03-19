import observable from './izi/observ.js'
import map from './izi/map.js'
import rseed from './rseed.js'
import router from './router.js'
const knownAi = [
  'abarnat',
  'abousque',
  'adarinot',
  'araveend',
  'bro',
  'cdenis',
  'fbertoia',
  'fsauvage',
  'kbennani',
  'knguyen',
  'ljahier',
  'mallano',
  'mestevez',
  'mgregoir',
  'overetou',
  'rchoquer',
  'rfautier',
  'rpaegelo',
  'sdutertr',
  'smj',
  'tgelu',
  'vbillard',
  'xpetit',
  'ycribier',
  'ygromith',
  'zabdalla',
]

const seed = observable(rseed.seed())
seed.set = (setSeed => s => setSeed(rseed.seed(Number(s))))(seed.set)

const defaults = {
  speedFactor: 32,
  users: [],
  seed: seed(),
}

const urlParams = (parsers =>
  map((val, key) => (parsers[key] || noOp)(val) || defaults[key], router.get()))
({ users: u => (u || '').split(','), seed: seed.set, refetch: v => v === 'true', })

urlParams.users || (urlParams.users = knownAi)

const players = []
const history = []
const speedFactor = observable.check(defaults.speedFactor)
const speedFactorBounds = [0.25, 32]

const decSpeed = () => speedFactor.set(Math.max(speedFactor() / 2, speedFactorBounds[0]))
const incSpeed = () => speedFactor.set(Math.min(speedFactor() * 2, speedFactorBounds[1]))

let previousSeed = seed()
const reset = () => {
  const newSeed = seed()
  if (newSeed !== previousSeed) {
    router.set({ seed: newSeed, users: urlParams.users.sort() })
    previousSeed = newSeed
  } else {
    rseed.seed(previousSeed)
  }
  window.location.reload()

  players.forEach(p => {
    p.dead = false
    p.score = 0
  })

  history.length = 0
}

router.set({ seed: previousSeed, users: urlParams.users.sort() })

export default {
  refetch: Boolean(urlParams.refetch),
  players,
  seed,
  users: urlParams.users,
  map: history,
  paused: observable.check(true),
  speedFactor,
  incSpeed,
  decSpeed,
  shouldReload: observable.check(false),
  reset,
}
