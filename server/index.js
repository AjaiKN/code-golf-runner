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
  server.register(require('fastify-cors'))
}

server.register(require('fastify-websocket'))

server.register(require('fastify-mongodb'), {
  forceClose: true,
  url: process.env.MONGO_URI,
})

server.register(require('./admin'))
server.register(require('./golfer'))
server.register(require('./crawler'))

async function start() {
  try {
    const PORT = process.env.PORT || 3000

    await server.listen(PORT)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
