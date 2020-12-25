import { ref } from 'https://unpkg.com/vue@3.0.4/dist/vue.esm-browser.js'
import { throttle } from './throttle.js'

// Set this to true when developing on local machine
const IS_DEVELOPMENT = ['localhost', '127.0.0.1', ''].includes(
  window.location.hostname,
)

const SERVER_URL = IS_DEVELOPMENT ? 'http://localhost:3000' : ''

function resolvePath(path) {
  if (path.startsWith('/')) path = SERVER_URL + path
  return path
}

async function getOrPost(isPost, /** @type {string} */ path, body) {
  path = resolvePath(path)
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

export function useWebsocket(path, { onConnect, onMessage, send }) {
  path = resolvePath(path).replace('http', 'ws')

  const isConnected = ref(false)

  let timeout = 100
  /** @type WebSocket */
  let ws

  function send(message) {
    ws.send(JSON.stringify(message))
  }

  const disconnected = throttle(() => {
    isConnected.value = false
    console.log('trying to reconnect... ' + timeout)
    setTimeout(() => {
      if (!isConnected.value) {
        ws.close()
        connectWebsocket()
        if (timeout < 2000) timeout += 200
      }
    }, timeout)
  }, 100)
  function connectWebsocket() {
    ws = new WebSocket(path)
    ws.addEventListener('open', () => {
      timeout = Math.min(timeout, 500)
      isConnected.value = true
      console.log('connected')
      if (onConnect) onConnect()
    })
    ws.addEventListener('message', (event) => {
      const { type, ...message } = JSON.parse(event.data)
      console.log({ type, ...message })
      if (onMessage && onMessage[type]) onMessage[type](message)
    })
    ws.addEventListener('close', disconnected)
    ws.addEventListener('error', disconnected)
  }
  connectWebsocket()

  setTimeout(() => {
    console.log('failed to connect')
    if (!isConnected.value) {
      disconnected()
    }
  }, 2000)

  return { isConnected, send }
}
