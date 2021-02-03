const S = require('fluent-json-schema').default
const { genSecretPhrase } = require('./diceware.js')
const { limitRate } = require('./auth-rate-limit.js')
const { censorGlobals, score } = require('./questions')
const querystring = require('querystring')
const { produce, setAutoFreeze } = require('immer')
setAutoFreeze(false)

/** @type {import('fastify').FastifyPluginAsync<{}>} */
module.exports = async function golfer(server) {
  const golfers = server.mongo.db.collection('golfers')
  const globals = server.mongo.db.collection('globals')
  const submissions = server.mongo.db.collection('submissions')

  server.get('/golfer', { websocket: true }, (connection, req) => {
    /** @type {null | {name: string}} */
    let authentication = null

    function send(/** @type {{type: string} & Record<string, any>} */ message) {
      connection.socket.send(JSON.stringify(message))
    }

    async function sendSubmissions(changeEvent, theGlobals) {
      if (authentication) {
        if (
          changeEvent?.fullDocument &&
          changeEvent.fullDocument.name !== authentication.name
        ) {
          return
        }

        const [theActualGlobals, theSubmissions] = await Promise.all([
          theGlobals ?? globals.findOne({}),
          submissions.find({ name: authentication.name }).toArray(),
        ])

        const processedSubmissions = score(
          theSubmissions,
          theActualGlobals,
          authentication.name,
        )

        send({
          type: 'update:submissions',
          // delete scores because we didn't calculate them from all the submissions
          submissions: produce(processedSubmissions, (draft) => {
            for (const s of draft) {
              delete s.score
            }
          }),
        })
      }
    }

    async function sendGlobals(changeEvent) {
      if (authentication) {
        console.log('updating globals!')
        const theGlobals =
          changeEvent?.fullDocument ?? (await globals.findOne({}))
        send({
          type: 'update:globals',
          globals: censorGlobals(theGlobals),
        })
        sendSubmissions(undefined, theGlobals)
      }
    }

    function authenticatedSuccessfully(golfer) {
      authentication = { name: golfer._id }
      send({
        type: 'authenticated',
        name: golfer._id,
        secretPhrase: golfer.secretPhrase,
      })
      sendGlobals()
    }

    connection.socket.on('message', async (messageUnparsed) => {
      const message = JSON.parse(messageUnparsed)
      if (message.type === 'auth') {
        message.name = message.name.trim()
        if (message.name === '') {
          send({ type: 'needLogin' })
          return
        }

        await limitRate()

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

    // Whenever the submissions or globals change in MongoDB, send admins an update.
    server.mongoWatchers.submissions.on('change', sendSubmissions)
    server.mongoWatchers.globals.on('change', sendGlobals)

    connection.socket.on('close', () => {
      server.mongoWatchers.submissions.off('change', sendSubmissions)
      server.mongoWatchers.globals.off('change', sendGlobals)
    })
  })

  // @ts-ignore
  server.register(require('fastify-formbody'))

  const { badGateway, notFound, forbidden } = server.httpErrors

  async function submit(body) {
    const person = await golfers.findOne({
      _id: body.name,
      secretPhrase: body.secretPhrase,
    })
    if (!person)
      return {
        status: badGateway().status,
        message: 'There is no person with that name and secret phrase',
      }

    const { questionNum } = body
    /** @type {import('./types').Globals} */
    const theGlobals = await globals.findOne({})
    const question = theGlobals.questions.find(
      (q) => q.questionNum === questionNum,
    )
    if (!question)
      return {
        status: notFound().status,
        message: `There is no question #${questionNum}`,
      }

    switch (question.status) {
      case 'notStarted':
        return {
          status: forbidden().status,
          message: `Question #${questionNum} hasn't started yet`,
        }
      case 'finished':
        body.isLate = true
    }

    await submissions.insertOne(
      produce(body, (draft) => {
        // Don't let golfers cheat by using these properties
        delete draft.result
        delete draft.overrideIsCorrect
        // Don't put the secret phrase into the submission document
        delete draft.secretPhrase
      }),
    )
    return {
      status: 200,
      message: `Submission submitted successfully at ${body.timestamp}`,
    }
  }

  // Accepting submissions (via POST request)
  server.post(
    '/submission',
    {
      schema: {
        body: S.object()
          .prop('name', S.string().required())
          .prop('secretPhrase', S.string().required())
          .prop('submission', S.string().required())
          .prop('questionNum', S.description('can be string or number')),
      },
    },
    async (/** @type {any} */ req, reply) => {
      req.body.timestamp = new Date()
      req.body.questionNum = parseInt(req.body.questionNum)

      const { message, status } = await submit(req.body)
      const shouldRespondWithHtml =
        req.headers['content-type'] === 'application/x-www-form-urlencoded'
      reply.statusCode = status
      if (shouldRespondWithHtml) {
        const stuff = { message, ...req.body }
        if (status === 200) {
          delete stuff.submission
          stuff.questionNum++
        }
        return reply.redirect(303, '/?' + querystring.stringify(stuff))
      } else {
        reply.send(message)
      }
    },
  )

  // simple HTML submission form
  server.get('/', (/** @type {any} */ req, reply) => {
    reply.view('./server-src/simplesubmission.mustache.html', req.query ?? {})
  })
}
