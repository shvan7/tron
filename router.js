const qs = require('izi/query-string')
const defaultsParams = {
  seed: Math.random(),
  users: [ 'cdenis', 'ycribier', 'xpetit' ],
}

const fromUrl = qs()

const params = module.exports = {
  seed: fromUrl.seed ? Number(fromUrl.seed) : defaultsParams.seed,
  users: fromUrl.users ? fromUrl.users.split(',') : defaultsParams.users,
}
window.location.hash = `?seed=${params.seed}&users=${params.users.join()}`
