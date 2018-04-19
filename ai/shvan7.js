const SIZE = 100
const MAP = new Int8Array(SIZE * SIZE) // L'etat de la carte
const isFree = ({ x, y }) => MAP[y * SIZE + x] === 0 // 0 = case pleine
const isOccupied = ({ x, y }) => MAP[y * SIZE + x] === 1 // 1 = case pleine

// cardinal
const N = 0
const E = 1
const S = 2
const W = 3
// direction (relative)
const TOP = 0
const RIGHT = 1
const BOTTOM = 2
const LEFT = 3

// `inBounds` regarde si notre coordonée (n) n'est pas hors de notre carte
const inBounds = n => n < SIZE && n >= 0

// `isInBounds` regarde verifie que les propriété x et y de l'argument sont
// bien inclue dans notre carte
const isInBounds = ({ x, y }) => inBounds(x) && inBounds(y)

// `pickRandom` choisi un élément aléatoire d'un tableau
const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)]

// catch players
const catchPlayer = (available, enemies, me) => {

  console.log(available)
  if (enemies.length !== 0) {
    const one = enemies[0].x - me.x > 0 ? E : W
    const two = enemies[0].y - me.y > 0 ? S : N
    const result = [
      {
        x: one === W ? me.x - 1 : me.x + 1,
        y: me.y
      },
      {
        x: me.x,
        y: two === N ? me.y - 1 : me.y + 1
      }
    ]
    if ((Math.abs(enemies[0].x - me.x) + Math.abs(enemies[0].y - me.y)) < 6) {
      console.log('ouille');
      return available[0]
    }
    return pickRandom(result)
  }
  else {
    return available[0]
  }
}
// `update` est la fonction appelé à chaque tours
const update = state => {
  const enemies = state.players.filter(p => p !== state.player)
  // update est appelé avec un argument state qui contient 4 propriétées :
  // - players qui contient la liste des joueurs
  // - player qui représente le joueur de cette AI

  // Chaques players contient:
  //   color: Un nombre qui représente la couleur du joueur
  //   name: Une String du nom du joueur
  //   score: Un nombre du score du joueur (nombre de pixel colorier)
  //   x: La position en horizontale du joueur
  //   y: La position en verticale du joueur
  //   coords: Un array des 4 coordonnés des cases les plus proche du joueur
  //     [ NORTH, EAST, SOUTH, WEST ]
  //                  N
  //               W  +  E
  //                  S

  // Chaques Coordonné contient:
  //   x: La position en horizontale
  //   y: La position en verticale
  //   cardinal: Un nombre entre 0 et 3 qui représente le cardinal
  //     [ 0: NORTH, 1: EAST, 2: SOUTH, 3: WEST ]
  //   direction: Un nombre entre 0 et 3 qui représente la direction
  //     [ 0: FORWARD, 1: RIGHT, 2: BACKWARD, 3: LEFT ]

  // Je filtre mon tableau pour ne gardé que les coordonées qui sont incluses
  // dans ma carte grace à `isInBounds`
  const coordsInBound = state.player.coords.filter(isInBounds)

  // Je filtre une nouvelle fois pour prendre ne gardé que les cases libres
  const available = coordsInBound.filter(isFree)
  const target = catchPlayer(available, enemies, state.player)
  // Je retourne une case au pif dans mon tableau de cases libres
  return target
  // return pickRandom(available)
}


// Il vaut mieu ne pas touché au code qui suit vu qu'il initialise et configure
// la communication du worker avec la page principale
// Evitez de le pourrir a moins que vraiment vous savez ce que vous faites.
addEventListener('message', self.init = initEvent => {
  const { seed, id } = JSON.parse(initEvent.data)
  const isOwnPlayer = p => p.name === id
  const addToMap = ({ x, y }) => MAP[y * SIZE + x] = 1

  let _seed = seed // On utilise une seed pour pouvoir replay les games
  const _m = 0x80000000
  Math.random = () => (_seed = (1103515245 * _seed + 12345) % _m) / (_m - 1)
  removeEventListener('message', self.init)
  addEventListener('message', ({ data }) => {
    const players = JSON.parse(data)
    const player = players.find(isOwnPlayer)
    players.forEach(addToMap) // J'ajoute toutes les nouvelles positions
    // des joueurs dans notre état de la carte `MAP`

    postMessage(JSON.stringify(update({ players, player })))
  })
  postMessage('loaded') // Signale que le chargement est fini
})