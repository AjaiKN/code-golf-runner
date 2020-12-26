const { limitRate } = require('./auth-rate-limit')

/** @type {import('fastify').FastifyPluginAsync<{}>} */
module.exports = async function admin(server) {
  const submissions = server.mongo.db.collection('submissions')

  const submissionsStream = submissions.watch()

  server.get('/admin', { websocket: true }, (connection, req) => {
    let isAuthenticated

    async function sendData() {
      if (isAuthenticated) {
        console.log('authenticated yes')
        connection.socket.send(
          JSON.stringify({
            type: 'update',
            submissions: await submissions.find().toArray(),
          }),
        )
      }
    }

    connection.socket.on('message', async (messageUnparsed) => {
      console.log(messageUnparsed)
      const message = JSON.parse(messageUnparsed)
      if (message.type === 'auth') {
        await limitRate()
        if (message.password === process.env.PASSWORD) {
          isAuthenticated = true
          sendData()
        } else {
          console.log('not authenticated')
        }
      }
    })

    submissionsStream.on('change', sendData)

    connection.socket.on('close', () => {
      submissionsStream.off('change', sendData)
    })
  })
}
