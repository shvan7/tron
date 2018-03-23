const getShaUrl = login =>
  `https://api.github.com/repos/${login}/tron/commits/master`

const getAIUrl = (login, sha, ai) =>
  `https://rawgit.com/${login}/tron/${sha}/ai/${ai || login}.js`

const getUrl = async (login, sha) => {
  if (location.hostname.endsWith('.github.io')) {
    return `${location.origin}/ai/${login}.js`
  }

  if (sha) return getAIUrl(login, sha)

  const res = await fetch(getShaUrl(login))
  if (res.ok) return getAIUrl(login, (await res.json()).sha)

  sha = (await (await fetch(getShaUrl('nan-academy'))).json()).sha
  return getAIUrl('nan-academy', sha, login)
}

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

