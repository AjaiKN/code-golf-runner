import { ref } from 'vue'
import destr from 'destr'

let SERVER_URL = (import.meta.env.VITE_SERVER_URL ??
  'http://localhost:3000') as string
// remove trailing slash
SERVER_URL = SERVER_URL.replace(/\/$/, '')

function resolvePath(path: string) {
  if (path.startsWith('/')) path = SERVER_URL + path
  return path
}

async function getOrPost(isPost: boolean, path: string, body?: any) {
  path = resolvePath(path)
  const res = await fetch(path, {
    method: isPost ? 'POST' : 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': isPost ? 'application/json' : (undefined as any),
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

/**
 * Perform a GET request
 * @param path URL path
 * @returns the JSON response
 */
export function get(path: string) {
  return getOrPost(false, path)
}

/**
 * Perform a POST request
 * @param path URL path
 * @param body body of the request
 * @returns the JSON response
 */
export function post(path: string, body: any) {
  return getOrPost(true, path, body)
}

export function useWebsocket(
  path: string,
  {
    onConnect,
    onMessage,
  }: {
    onConnect?: () => void
    onMessage?: Record<string, (message: any) => void>
  },
) {
  path = resolvePath(path).replace('http', 'ws')

  const isConnected = ref(false)

  let timeout = 100

  let ws: WebSocket

  function send(message: { type: string } & Record<string, any>) {
    if (ws.readyState === 1) ws.send(JSON.stringify(message))
    else console.error('cannot send message; websocket not open')
  }

  const disconnected = () => {
    isConnected.value = false
    console.log('trying to reconnect... ' + timeout)
    setTimeout(() => {
      if (!isConnected.value) {
        ws.close()
        connectWebsocket()
        if (timeout < 2000) timeout += 200
      }
    }, timeout)
  }

  function connectWebsocket() {
    ws = new WebSocket(path)
    ws.addEventListener('open', () => {
      timeout = Math.min(timeout, 500)
      isConnected.value = true
      console.log('connected')
      if (onConnect) onConnect()
    })
    ws.addEventListener('message', (event) => {
      const { type, ...message } = destr(event.data)
      console.log({ type, ...message })
      if (onMessage && onMessage[type]) onMessage[type](message)
    })
    ws.addEventListener('close', disconnected)
    // ws.addEventListener('error', disconnected)
  }
  connectWebsocket()

  setTimeout(() => {
    if (!isConnected.value) {
      console.log('failed to connect after 4s')
      disconnected()
    }
  }, 4000)

  // https://devcenter.heroku.com/articles/websockets#timeouts
  setInterval(() => send({ type: 'ping' }), 20000)

  return { isConnected, send }
}
