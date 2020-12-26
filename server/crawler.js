const { ObjectId } = require('mongodb')
const { limitRate } = require('./auth-rate-limit')

/** @type {import('fastify').FastifyPluginAsync<{}>} */
module.exports = async function crawler(server) {
  const submissions = server.mongo.db.collection('submissions')

  const query = { result: { $exists: false } }
  const projection = { _id: true, submission: true }
  const pipeline = [{ $match: query }, { $project: projection }]
  const submissionsStream = submissions.watch(pipeline)

  server.get('/crawler', { websocket: true }, async (connection, req) => {
    await limitRate()

    // authenticate
    console.log('crawler connected')
    if (req.headers.password !== process.env.PASSWORD) {
      connection.socket.close()
      return
    }

    async function sendData() {
      connection.socket.send(
        JSON.stringify({
          type: 'update',
          submissions: await submissions
            .find(query)
            .project(projection)
            .toArray(),
        }),
      )
    }

    sendData()

    connection.socket.on('message', async (messageUnparsed) => {
      const { type, ...message } = JSON.parse(messageUnparsed)
      if (type === 'testresult') {
        const { _id, result } = message
        submissions.updateOne({ _id: new ObjectId(_id) }, { $set: { result } })
      }
    })

    submissionsStream.on('change', sendData)

    connection.socket.on('close', () => {
      submissionsStream.off('change', sendData)
    })
  })
}
