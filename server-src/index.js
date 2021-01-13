// @ts-nocheck

const fastify = require('fastify').default
const server = fastify({
  logger: {
    prettyPrint: process.env.NODE_ENV !== 'production',
    redact: ['name'],
  },
})

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
server.register(require('fastify-cors'))

fastify.register(require('fastify-sensible'))

server.register(require('fastify-websocket'))

server.register(require('fastify-mongodb'), {
  forceClose: true,
  url: process.env.MONGO_URI,
})

server.register(require('./mongo-watchers'))

server.register(require('./admin'))
server.register(require('./golfer'))
server.register(require('./crawler'))

async function start() {
  try {
    const port = process.env.PORT || 3000
    const host = '0.0.0.0'

    await server.listen({ port, host })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
