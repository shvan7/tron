const qs = require('izi/query-string')
const defaultsParams = {
  seed: Math.random(),
  users: [
    'fbertoia',
    'bro',
    'rchoquer',
    'kbennani',
    'tgelu',
    'adarinot',
    'xpetit',
    'mgregoir',
    'rfautier',
    'ycribier',
    'cdenis'
  ],
}

const fromUrl = qs()
const params = module.exports = {
  seed: fromUrl.seed ? Number(fromUrl.seed) : defaultsParams.seed,
  users: fromUrl.users ? fromUrl.users.split(',') : defaultsParams.users,
}
window.location.hash = `?users=${params.users.join()}&seed=${params.seed}`
window.addEventListener('hashchange', () => {
  window.location.reload(1)
})
