const { limitRate } = require('./auth-rate-limit')
const { annotateSubmission } = require('./questions')

/** @type {import('fastify').FastifyPluginAsync<{}>} */
module.exports = async function admin(server) {
  const submissions = server.mongo.db.collection('submissions')
  const globals = server.mongo.db.collection('globals')

  server.get('/admin', { websocket: true }, (connection, _req) => {
    let isAuthenticated

    function send(/** @type {{type: string} & Record<string, any>} */ message) {
      connection.socket.send(JSON.stringify(message))
    }

    // async function sendSubmissions() {
    //   if (isAuthenticated) {
    //     console.log('authenticated yes')
    //     const theSubmissions = await submissions.find().toArray()
    //     send({
    //       type: 'update',
    //       submissions: theSubmissions.map(annotateSubmission),
    //     })
    //   }
    // }

    // async function sendGlobals(changeEvent) {
    //   if (isAuthenticated) {
    //     send({
    //       type: 'update:globals',
    //       globals: changeEvent?.fullDocument ?? (await globals.findOne({})),
    //     })
    //     sendSubmissions()
    //   }
    // }

    async function sendSubmissions(changeEvent, theGlobals) {
      if (isAuthenticated) {
        const [theActualGlobals, theSubmissions] = await Promise.all([
          theGlobals ?? globals.findOne({}),
          submissions.find().toArray(),
        ])

        send({
          type: 'update',
          submissions: theSubmissions.map((s) =>
            annotateSubmission(s, theActualGlobals.questions),
          ),
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
      const message = JSON.parse(messageUnparsed)
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

    server.mongoWatchers.submissions.on('change', sendSubmissions)
    server.mongoWatchers.globals.on('change', sendGlobals)

    connection.socket.on('close', () => {
      server.mongoWatchers.submissions.off('change', sendSubmissions)
      server.mongoWatchers.globals.off('change', sendGlobals)
    })
  })
}

export {}