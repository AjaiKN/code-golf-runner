const { ObjectId } = require('mongodb')
const { limitRate } = require('./auth-rate-limit')
const { normalizeInput } = require('./questions')

/** @type {import('fastify').FastifyPluginAsync<{}>} */
module.exports = async function crawler(server) {
  const submissions = server.mongo.db.collection('submissions')

  server.get('/crawler', { websocket: true }, async (connection, req) => {
    await limitRate()

    // authenticate
    console.log('crawler connected')
    if (req.headers.password !== process.env.PASSWORD) {
      connection.socket.close()
      return
    }

    async function sendData() {
      console.log('sending data to crawler')
      const [theGlobals, theSubmissions] = await Promise.all([
        server.mongo.db.collection('globals').findOne({}),
        submissions
          .find({ result: { $exists: false } })
          .project({ _id: true, submission: true, questionNum: true })
          .toArray(),
      ])

      for (const submission of theSubmissions) {
        const question = theGlobals.questions.find(
          (q) => q.questionNum === submission.questionNum,
        )
        submission.inputs = question.inputsOutputs.map(({ input }) =>
          normalizeInput(input),
        )
      }

      connection.socket.send(
        JSON.stringify({
          type: 'update',
          submissions: theSubmissions,
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

    server.mongoWatchers.submissions.on('change', sendData)

    connection.socket.on('close', () => {
      server.mongoWatchers.submissions.off('change', sendData)
    })
  })
}
