const { limitRate } = require('./auth-rate-limit')
const { score, getPeopleRankings } = require('./questions')
const destr = require('destr')

/** @type {import('fastify').FastifyPluginAsync<{}>} */
module.exports = async function admin(server) {
  const submissions = server.mongo.db.collection('submissions')
  const globals = server.mongo.db.collection('globals')

  server.get('/admin', { websocket: true }, (connection, _req) => {
    let isAuthenticated

    // Send message over websocket
    function send(/** @type {{type: string} & Record<string, any>} */ message) {
      connection.socket.send(JSON.stringify(message))
    }

    async function sendSubmissions(changeEvent, theGlobals) {
      if (isAuthenticated) {
        const [theActualGlobals, theSubmissions] = await Promise.all([
          theGlobals ?? globals.findOne({}),
          submissions.find().toArray(),
        ])

        send({
          type: 'update',
          submissions: score(theSubmissions, theActualGlobals),
          rankings: getPeopleRankings(theSubmissions, theActualGlobals, false),
        })
      }
    }

    async function sendGlobals(changeEvent) {
      if (isAuthenticated) {
        const theGlobals =
          changeEvent?.fullDocument ?? (await globals.findOne({}))
        send({
          type: 'update:globals',
          globals: theGlobals,
        })
        sendSubmissions(undefined, theGlobals)
      }
    }

    connection.socket.on('message', async (messageUnparsed) => {
      const message = destr(messageUnparsed)
      if (message.type === 'auth') {
        await limitRate()
        if (message.password === process.env.PASSWORD) {
          isAuthenticated = true
          sendGlobals()
        } else {
          console.log('not authenticated')
        }
      } else if (!isAuthenticated) {
        return
      } else if (message.type === 'update:globals') {
        await globals.replaceOne({}, message.globals)
      }
    })

    // Whenever the submissions or globals change in MongoDB, send admins an update.
    server.mongoWatchers.submissions.on('change', sendSubmissions)
    server.mongoWatchers.globals.on('change', sendGlobals)

    connection.socket.on('close', () => {
      server.mongoWatchers.submissions.off('change', sendSubmissions)
      server.mongoWatchers.globals.off('change', sendGlobals)
    })
  })
}
