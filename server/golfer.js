const S = require('fluent-json-schema').default

async function genSecretPhrase() {
  return 'the-secret-phrase'
}

function pick(object, properties) {
  const ret = {}
  for (const p of properties) {
    ret[p] = object[p]
  }
  return ret
}

/** @type {import('fastify').FastifyPluginAsync<{}>} */
module.exports = async function golfer(server) {
  const golfers = server.mongo.db.collection('golfers')
  const globals = server.mongo.db.collection('globals')
  const submissions = server.mongo.db.collection('submissions')

  const submissionsStream = submissions.watch(undefined, {
    fullDocument: 'updateLookup',
  })

  const globalsStream = globals.watch()

  server.get('/golfer', { websocket: true }, (connection, req) => {
    /** @type {null | {name: string}} */
    let authentication = null

    function send(message) {
      connection.socket.send(JSON.stringify(message))
    }

    async function sendGlobals() {
      if (authentication) {
        send({
          type: 'update:globals',
          globals: await globals.findOne({ _id: 'globals' }),
        })
      }
    }

    async function sendSubmissions(changeEvent) {
      if (authentication) {
        if (
          changeEvent &&
          changeEvent.fullDocument.name !== authentication.name
        ) {
          return
        }
        const theSubmissions = (
          await submissions.find({ name: authentication.name }).toArray()
        ).map((submission) => {
          // TODO
          const isQuestionStillInProgress = false
          if (isQuestionStillInProgress) {
            if (submission.result)
              submission.result = pick(submission.result, [
                'lang',
                'code',
                'header',
                'footer',
                'commandLineOptions',
                'commandLineArguments',
              ])
            return pick(submission, [
              '_id',
              'name',
              'submission',
              'timestamp',
              'result',
            ])
          } else {
            return submission
          }
        })
        send({
          type: 'update:submissions',
          submissions: theSubmissions,
        })
      }
    }

    function sendAllData() {
      sendGlobals()
      sendSubmissions()
    }

    function authenticatedSuccessfully(golfer) {
      authentication = { name: golfer._id }
      send({
        type: 'authenticated',
        name: golfer._id,
        secretPhrase: golfer.secretPhrase,
      })
      sendAllData()
    }

    connection.socket.on('message', async (messageUnparsed) => {
      const message = JSON.parse(messageUnparsed)
      if (message.type === 'auth') {
        message.name = message.name.trim()
        if (message.name === '') {
          send({ type: 'needLogin' })
          return
        }
        let golfer = await golfers.findOne({ _id: message.name })
        if (golfer) {
          if (golfer.secretPhrase === message.secretPhrase) {
            authenticatedSuccessfully(golfer)
          } else {
            send({ type: 'needSecretPhrase' })
          }
        } else {
          const secretPhrase = await genSecretPhrase()
          golfer = { _id: message.name, secretPhrase }
          await golfers.insertOne(golfer)
          authenticatedSuccessfully(golfer)
        }
      }
    })

    submissionsStream.on('change', sendSubmissions)
    globalsStream.on('change', sendGlobals)

    connection.socket.on('close', () => {
      submissionsStream.off('change', sendSubmissions)
      globalsStream.off('change', sendGlobals)
    })
  })

  server.post(
    '/submission',
    {
      schema: {
        body: S.object()
          .prop('name', S.string().required())
          .prop('secretPhrase', S.string().required())
          .prop('submission', S.string().required()),
      },
    },
    async (/** @type any */ req) => {
      const timestamp = new Date()
      await submissions.insertOne({ ...req.body, timestamp })
      return {}
    },
  )
}
