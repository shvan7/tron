const SIZE = 100

// `inBounds` regarde si notre coordonée (n) n'est pas hors de notre carte
const inBounds = n => n < SIZE && n >= 0

// `isInBounds` regarde verifie que les propriété x et y de l'argument sont
// bien inclue dans notre carte
const isInBounds = ({ x, y }) => inBounds(x) && inBounds(y)

// `pickRandom` choisi un élément aléatoire d'un tableau
const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)]

// `update` est la fonction appelé à chaque tours
const update = state => {
  // update est appelé avec un argument state qui contient 4 propriétées :
  // - isFree qui check si une case est libre
  // - isOccupied qui check si une case est occupée
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
  const available = coordsInBound.filter(state.isFree)

  // Je retourne une case au pif dans mon tableau de cases libres
  return pickRandom(available)
}


// Il vaut mieu ne pas touché au code qui suit vu qu'il initialise et configure
// la communication du worker avec la page principale
// Evitez de le pourrir a moins que vraiment vous savez ce que vous faites.
addEventListener('message', self.init = initEvent => {
  const { seed, id } = JSON.parse(initEvent.data)
  const isOwnPlayer = p => p.name === id
  const MAP = new Int8Array(SIZE * SIZE)
  const addToMap = ({ x, y }) => MAP[x * SIZE + y] = 1
  const isFree = ({ x, y }) => MAP[x * SIZE + y] === 0
  const isOccupied = ({ x, y }) => MAP[x * SIZE + y] === 1

  let _seed = seed // On utilise une seed pour pouvoir replay les games
  const _m = 0x80000000
  Math.random = () => (_seed = (1103515245 * _seed + 12345) % _m) / (_m - 1)
  removeEventListener('message', self.init)
  addEventListener('message', ({ data }) => {
    const players = JSON.parse(data)
    const player = players.find(isOwnPlayer)
    players.forEach(addToMap)

    postMessage(JSON.stringify(update({ isFree, isOccupied, players, player })))
  })
  postMessage('loaded') // Signale que le chargement est fini
})

