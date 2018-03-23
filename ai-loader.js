const getShaUrl = login =>
  `https://api.github.com/repos/${login}/tron/commits/master`

const getAIUrl = (login, sha) =>
  `https://rawgit.com/${login}/tron/${sha}/ai/${login}.js`

const handleLogin404 = async res => (res.ok
  ? (await fetch(getShaUrl('nan-academy')))
  : res).json().sha

const getUrl = async (login, sha) => !location.hostname.endsWith('.github.io')
  ? `${location.origin}/ai/${login}.js`
  : getAIUrl(login, sha || (sha = (await fetch(getShaUrl(login))
      .then(handleLogin404))))

export default async ({ name, id, sha, seed }) => {
  const w = new Worker(await getUrl(name, sha), { type: 'module' })

  await new Promise((s, f) => {
    w.onmessage = e => e.data === 'loaded' ? s() : f(Error(e.data))
    w.onerror = f
    w.postMessage(JSON.stringify({ id, seed }))
  })

  const timeoutError = Error('timeout')
  let t
  const handleWorkerAnswer = (s, f) => {
    clearTimeout(t)
    t = setTimeout(f, 1000, timeoutError)
    w.onmessage = s
    w.onerror = f
  }

  return map => {
    w.postMessage(map)
    return new Promise(handleWorkerAnswer)
  }
}

