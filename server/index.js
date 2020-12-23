// @ts-check

const fastify = require('fastify').default
const server = fastify({
  logger: {
    prettyPrint: process.env.NODE_ENV !== 'production',
    // @ts-ignore
    redact: ['name'],
  },
})

const S = require('fluent-json-schema').default

const resultType = S.anyOf([
  S.null(),
  S.object()
    .prop('lang', S.string().required())
    .prop('code', S.string().required())
    .prop(
      'inputsOutputs',
      S.array()
        .items(
          S.object()
            .prop('input', S.string().required())
            .prop('output', S.string().required())
            .prop('debug', S.string().required()),
        )
        .required(),
    )
    .prop('header', S.anyOf([S.null(), S.string()]).required())
    .prop('footer', S.anyOf([S.null(), S.string()]).required())
    .prop('commandLineOptions', S.array().items(S.string()).required())
    .prop('commandLineArguments', S.array().items(S.string()).required()),
])

const submissionType = S.object()
  .prop('_id', S.string().required())
  .prop('name', S.string().required())
  .prop('submission', S.string().required())
  .prop('result', resultType)
  .prop('timestamp', S.string().required())

const { MongoClient } = require('mongodb')

const { nanoid } = require('nanoid/async')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()

  // @ts-ignore
  server.register(require('fastify-cors'))
}
/** @type {MongoClient} */
let mongo

server.post(
  '/submission',
  {
    schema: {
      body: S.object()
        .prop('name', S.string().required())
        .prop('submission', S.string().required()),
    },
  },
  async (/** @type any */ req) => {
    const timestamp = new Date()
    const _id = await nanoid()
    await mongo
      .db('codegolf')
      .collection('submissions')
      .insertOne({ ...req.body, timestamp, _id })
    return { timestamp, _id }
  },
)

const THE_PASSWORD = process.env.PASSWORD
console.log(THE_PASSWORD)
function checkPassword(/** @type {string} */ password) {
  if (password !== THE_PASSWORD) {
    console.log({ password, THE_PASSWORD })
    throw { errorCode: 401, message: 'Wrong password' }
  }
}

server.get(
  '/admininfo',
  {
    schema: {
      querystring: S.object().prop('password', S.string().required()),
      response: {
        200: S.object().prop(
          'submissions',
          S.array().items(submissionType).required(),
        ),
      },
    },
  },
  async (/** @type any */ req) => {
    checkPassword(req.query.password)
    return {
      submissions: await mongo
        .db('codegolf')
        .collection('submissions')
        .find()
        .toArray(),
    }
  },
)

server.post(
  '/testresult',
  {
    schema: {
      body: S.object()
        .prop('_id', S.string())
        .prop('result', resultType)
        .prop('password', S.string()),
    },
  },
  async (/** @type any */ req, reply) => {
    // checkPassword(req.body.password)
    console.log(req.body._id)
    const res = await mongo
      .db('codegolf')
      .collection('submissions')
      .updateOne({ _id: req.body._id }, { $set: { result: req.body.result } })
    return {}
  },
)

server.get(
  '/testsneeded',
  {
    schema: {
      querystring: S.object().prop('password', S.string().required()),
      response: {
        200: S.object().prop(
          'submissions',
          S.array()
            .items(
              S.object()
                .prop('_id', S.string().required())
                .prop('submission', S.string().required()),
            )
            .required(),
        ),
      },
    },
  },
  async (/** @type {any} */ req) => {
    // checkPassword(req.password)
    const submissions = await mongo
      .db('codegolf')
      .collection('submissions')
      .find({ result: { $exists: false } })
      .project({ _id: true, submission: true })
      .toArray()
    const inputs = ['5\n', '6\n', '7\n']
    return { submissions, inputs }
  },
)

server.get(
  '/golferinfo',
  {
    schema: {
      querystring: S.object().prop('ids', S.string().required()),
      response: {
        200: S.object()
          .prop('introduction', S.string().required())
          .prop('submissions', S.array().items(submissionType).required()),
      },
    },
  },
  async (/** @type any */ req) => {
    const { ids } = req.query
    const idsArray = ids ? ids.split(' ') : []
    console.log({ idsArray })
    const [globals, submissions] = await Promise.all([
      mongo.db('codegolf').collection('globals').findOne({ _id: 'globals' }),
      mongo
        .db('codegolf')
        .collection('submissions')
        // TODO: only allow ids for questions that are done
        .find({ _id: { $in: idsArray } })
        .toArray(),
    ])
    return { ...globals, submissions }
  },
)

async function start() {
  try {
    // connect to MongoDB
    mongo = await new MongoClient(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).connect()

    // start fastify server
    const PORT = process.env.PORT || 3000

    await server.listen(PORT)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
