// @ts-check

const fastify = require('fastify').default
const server = fastify({
  logger: {
    prettyPrint: process.env.NODE_ENV !== 'production',
    // @ts-ignore
    redact: ['name'],
  },
})

const { MongoClient, ObjectId } = require('mongodb')

const { nanoid } = require('nanoid/async')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
/** @type {MongoClient} */
let mongo

server.post(
  '/submission',
  {
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          submission: { type: 'string' },
        },
        required: ['name', 'submission'],
      },
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
      querystring: {
        type: 'object',
        properties: {
          password: { type: 'string' },
        },
        required: ['password'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            submissions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  name: { type: 'string' },
                  submission: { type: 'string' },
                  result: {},
                  timestamp: { type: 'string' },
                },
                required: ['_id', 'name', 'submission', 'timestamp'],
              },
            },
          },
          required: ['submissions'],
        },
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
      body: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          result: {},
          password: { type: 'string' },
        },
        required: ['_id', 'result', 'password'],
      },
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
      querystring: {
        type: 'object',
        properties: {
          password: { type: 'string' },
        },
        required: ['password'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            submissions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  submission: { type: 'string' },
                },
                required: ['_id', 'submission'],
              },
            },
            inputs: { type: 'array', items: { type: 'string' } },
          },
          required: ['submissions', 'inputs'],
        },
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
      querystring: {
        type: 'object',
        properties: {
          // separated by +s
          ids: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            introduction: { type: 'string' },
            submissions: {},
          },
          required: ['introduction', 'submissions'],
        },
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
