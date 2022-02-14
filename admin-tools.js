// TODO: finish manually testing these
// TODO: add user deletion

const { ObjectId } = require('mongodb')
const { MongoClient } = require('mongodb')
const prompts = require('prompts')
const { annotateSubmission } = require('./server-src/questions')

require('dotenv').config()

const client = new MongoClient(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

async function loop() {
  async function chooseQuestionNums() {
    const globals = await getGlobals()
    const questionNums = globals.questions
      .map((q) => q.questionNum)
      .sort((a, b) => a - b)
    const { chosenNums } = await prompts({
      type: 'multiselect',
      name: 'chosenNums',
      message: 'Only these questionNums',
      choices: questionNums.map((n) => ({ title: n.toString(), value: n })),
    })
    return chosenNums
  }

  /** @type {Record<string, () => void>} */
  const commands = {
    async 'rename golfer (or merge old into new)'() {
      const { oldName, newName, isMerge } = await prompts([
        { type: 'text', name: 'oldName', message: 'old name' },
        { type: 'text', name: 'newName', message: 'new name' },
        {
          type: 'toggle',
          name: 'isMerge',
          message: 'merge old into new? (i.e. both already exist)',
          inactive: 'no',
          active: 'yes',
        },
      ])

      const old = await golfers.findOne({ _id: oldName })
      if (!old) {
        console.log(`no golfers found with name ${oldName}`)
        return
      }
      const { secretPhrase } = old

      if (isMerge) {
        const newGolfer = await golfers.findOne({ _id: newName })
        if (!newGolfer) {
          console.log(
            `no golfers with merge-to name ${newName}. maybe don't merge?`,
          )
          return
        }
      } else {
        let res1
        try {
          res1 = await golfers.insertOne({ _id: newName, secretPhrase })
        } catch (e) {
          console.error(e)
          console.log(`unable to insert. maybe use merge instead?`)
          return
        }
        console.log(`golfers: ${res1.insertedCount} inserted`)
      }

      const res2 = await golfers.deleteOne({ _id: oldName })
      console.log(`golfers: ${res2.deletedCount} deleted`)

      const res3 = await submissions.updateMany(
        { name: oldName },
        { $set: { name: newName } },
      )
      console.log(
        `submissions: ${res3.matchedCount} matched, ${res3.modifiedCount} modified`,
      )
    },
    async 'rescore results for submissions that failed to run'() {
      const res1 = await submissions.updateMany(
        { result: null, questionNum: { $in: await chooseQuestionNums() } },
        { $unset: { result: '' } },
      )
      console.log(
        `submissions: ${res1.matchedCount} matched, ${res1.modifiedCount} modified`,
      )
      console.log(`You might need to restart the crawler`)
    },
    async 'rescore results for incorrect (or failed) submissions'() {
      const globals = await getGlobals()
      const allSubmissions = await submissions
        .find({ questionNum: { $in: await chooseQuestionNums() } })
        .toArray()
      const annotatedSubmissions = allSubmissions.map((s) =>
        annotateSubmission(s, globals.questions),
      )
      const incorrectIds = annotatedSubmissions
        .filter((s) => !s.correctness.correct)
        .map((s) => s._id)
      const res1 = await submissions.updateMany(
        { _id: { $in: incorrectIds } },
        { $unset: { result: '' } },
      )
      console.log(
        `submissions: ${res1.matchedCount} matched, ${res1.modifiedCount} modified`,
      )
      console.log(`You might need to restart the crawler`)
    },
    async 'rescore all results'() {
      const res1 = await submissions.updateMany(
        { questionNum: { $in: await chooseQuestionNums() } },
        { $unset: { result: '' } },
      )
      console.log(
        `submissions: ${res1.matchedCount} matched, ${res1.modifiedCount} modified`,
      )
      console.log(`You might need to restart the crawler`)
    },
    async 'override correctness'() {
      const { ids, overrideIsCorrect } = prompts([
        {
          name: 'ids',
          type: 'list',
          message: '_ids? (separate with commas)',
        },
        {
          name: 'overrideIsCorrect',
          type: 'toggle',
          message: 'new correctness?',
          inactive: 'incorrect',
          inactive: 'correct',
          initial: true,
        },
      ])
      const objectIds = ids.map((id) => ObjectId(id))
      await submissions.updateMany(
        { _id: { $in: [ids, ...objectIds] } },
        { overrideIsCorrect },
      )
    },
    async 'generate secret phrase'() {
      console.log(await require('./server-src/diceware').genSecretPhrase())
    },
    async 'DANGER: delete all submissions'() {
      const shouldDelete = await prompts({
        type: 'confirm',
        name: 'value',
        message: 'Are you sure?',
      })
      if (shouldDelete.value) {
        const res1 = await submissions.deleteMany({})
        console.log(`submissions: ${res1.deletedCount} deleted`)
      }
    },
  }

  const choices = Object.entries(commands).map(([title, value]) => ({
    title,
    value,
  }))

  const promptRes = prompts({
    type: 'select',
    name: 'command',
    message: 'command',
    choices: [...choices, { title: 'quit', value: 'quit' }],
  })

  const db = client.db('codegolf')

  const golfers = db.collection('golfers')
  const submissions = db.collection('submissions')
  const getGlobals = () => db.collection('globals').findOne({})

  const theResult = await promptRes
  if (theResult.command === 'quit') return
  await theResult.command()

  await loop()
}

client
  .connect()
  .then(loop)
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    console.log('closing')
    await client.close()
    console.log('closed')
  })
