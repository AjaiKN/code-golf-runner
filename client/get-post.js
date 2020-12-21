// Set this to true when developing on local machine
const IS_DEVELOPMENT = ['localhost', '127.0.0.1', ''].includes(
  window.location.hostname,
)

const SERVER_URL = IS_DEVELOPMENT ? 'http://localhost:3000' : ''

async function getOrPost(isPost, /** @type {string} */ path, body) {
  if (path.startsWith('/')) path = SERVER_URL + path
  const res = await fetch(path, {
    method: isPost ? 'POST' : 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': isPost ? 'application/json' : undefined,
    },
    body: body && JSON.stringify(body),
  })
  if (!res.ok) {
    let errorMessage = res.statusText + '\n'
    try {
      errorMessage += (await res.json()).message
    } finally {
      throw Error(errorMessage)
    }
  }
  return res.json()
}

export function get(path) {
  return getOrPost(false, path)
}

export function post(path, body) {
  return getOrPost(true, path, body)
}
