const http = require('http')
const fetch = require('node-fetch')
const { parse: parseUrl } = require('url')
const { promisify } = require('util')
const fs = require('fs')
const readFile = promisify(fs.readFile)

const index = readFile('./index.html')

const httpError = (code, message = '') =>
  Object.assign(message instanceof Error ? message : Error(message), { code })

const toText = res => res.status === 200
  ? res.text()
  : Promise.reject(httpError(res.status, res.statusText))

const routes = {
  '/': (req, url) => index,
  default: (req, url) =>
    fetch(`https://thot.space${url.pathname}/tron/raw/master/ai.js`)
      .then(toText),
}

http.createServer((req, res) => {
  const url = parseUrl(req.url)
  const route = routes[url.pathname] || routes.default

  route(req, url).then(successText => res.end(successText), err => {
    const code = err.code || 500
    res.writeHead(code, http.STATUS_CODES[code])
    res.end(`error ${code}: ${http.STATUS_CODES[code]}\n${err.stack}`)
  })
}).listen(7587)