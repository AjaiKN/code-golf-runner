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

server.register(require('fastify-sensible'))

server.register(require('fastify-websocket'))

server.register(require('fastify-mongodb'), {
  forceClose: true,
  url: process.env.MONGO_URI,
})

// Create globals document if it doesn't exist
server.register(async (theServer) => {
  try {
    await theServer.mongo.db.collection('globals').insertOne({
      _id: 'globals',
      introduction: '',
      questions: [],
    })
    console.log('created globals document')
  } catch (e) {
    console.log('globals document already exists')
  }
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
