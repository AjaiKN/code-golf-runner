import produce from 'immer'
import { nanoid } from 'nanoid'
import { getPeopleRankings, score } from './questions'
import { Globals, Result, Submission } from './types'
import { ObjectId } from 'mongodb'

const globals: Globals = {
  introduction: '',
  questions: [
    {
      questionNum: 1,
      status: 'finished',
      text: 'add 1 to a number',
      inputsOutputs: [
        { input: '5', output: '6', isGivenExample: true },
        { input: '6', output: '7', isGivenExample: true },
        { input: '7', output: '8', isGivenExample: false },
      ],
    },
    {
      questionNum: 2,
      status: 'started',
      text: 'add 1 to a number again.',
      inputsOutputs: [
        { input: '5', output: '6', isGivenExample: true },
        { input: '6', output: '7', isGivenExample: true },
        { input: '7', output: '8', isGivenExample: false },
      ],
    },
    {
      questionNum: 3,
      status: 'started',
      text: 'Add two numbers (separated by a newline) together.',
      inputsOutputs: [
        { input: '3\n5', output: '8', isGivenExample: true },
        { input: '9\n-2', output: '7', isGivenExample: false },
      ],
    },
  ],
}

const correctResult = (numBytes: number): Result => ({
  code: 'a'.repeat(numBytes),
  commandLineArguments: [],
  commandLineOptions: [],
  footer: null,
  header: null,
  inputsOutputs: [
    { input: '5', output: '6', debug: '' },
    { input: '6', output: '7', debug: '' },
    { input: '7', output: '8', debug: '' },
  ],
  lang: '',
})

const submissions1 = (questionNum: number): Submission[] => [
  /*------ QUESTION 1 -------*/
  {
    name: 'A',
    isLate: false,
    questionNum,
    submission: 'invalid url',
    timestamp: '2021-01-24T19:36:38.319+00:00',
    result: null,
    notes: { score: 0 },
  },
  {
    name: 'B',
    isLate: false,
    questionNum,
    submission: 'https://tio.run/##KypNqvz/v0AhPbWkWK8kPz5T2/D/fwA',
    timestamp: new Date('2021-02-25'),
    // result still submitting
    notes: { score: 0 },
  },
  {
    name: 'C',
    isLate: false,
    questionNum,
    submission: 'https://tio.run/##KypNqvz/v0AhPbWkWK8kPz5T2/D/fwA',
    timestamp: '2021-02-25T00:31',
    result: correctResult(10),
    // shouldn't count because outdated
    notes: { score: 0 },
  },
  {
    name: 'C',
    isLate: false,
    questionNum,
    submission: 'https://tio.run/##KypNqvz/v0AhPbWkWK8kPz5T2/D/fwA',
    timestamp: '2021-02-25T00:30',
    result: correctResult(1),
    // shouldn't count because outdated
    notes: { score: 0 },
  },
  {
    name: 'C',
    isLate: false,
    questionNum,
    submission: 'https://tio.run/##KypNqvz/v0AhPbWkWK8kPz5T2/D/fwA',
    timestamp: '2021-02-25T01:00',
    result: correctResult(6),
    notes: { score: 7 },
  },
  {
    name: 'C',
    isLate: true,
    questionNum,
    submission: 'https://tio.run/##KypNqvz/v0AhPbWkWK8kPz5T2/D/fwA',
    timestamp: '2021-02-25T02:30',
    // shouldn't count because late
    notes: { score: 0 },
  },
  {
    name: 'D',
    isLate: true,
    questionNum,
    submission: 'https://tio.run/##KypNqvz/v0AhPbWkWK8kPz5T2/D/fwA',
    timestamp: '2021-02-29T02:31',
    // shouldn't count because late
    result: correctResult(3),
    notes: { score: 0 },
  },
  {
    name: 'E',
    isLate: false,
    questionNum,
    submission: 'https://tio.run/##KypNqvz/v0AhPbWkWK8kPz5T2/D/fwA',
    timestamp: '2021-02-25T00:30',
    result: correctResult(5),
    notes: { score: 8 },
  },
  {
    name: 'Q',
    isLate: false,
    questionNum,
    submission: 'https://tio.run/##thisgivesthewrongoutput',
    timestamp: '2021-02-25T00:30',
    result: produce(correctResult(1), (draft) => {
      draft.inputsOutputs[0].output = '7'
    }),
    // incorrect
    notes: { score: 0 },
  },
]

const correctResultForManyPeople = (numBytes: number): Result => ({
  code: 'a'.repeat(numBytes),
  commandLineArguments: [],
  commandLineOptions: [],
  footer: null,
  header: null,
  inputsOutputs: [
    { input: '3\n5', output: '8', debug: '' },
    { input: '9\n-2', output: '7', debug: '' },
  ],
  lang: '',
})

const submissionsManyPeople = (questionNum: number): Submission[] => [
  {
    name: 'A',
    isLate: false,
    questionNum,
    submission: 'https://tio.run/##KypNqvz/v0AhPbWkWK8kPz5T2/D/fwA',
    timestamp: '2021-01-24T19:36:38.319+00:00',
    result: correctResultForManyPeople(1),
    notes: { score: 8 },
  },
  {
    name: 'B',
    isLate: false,
    questionNum,
    submission: 'https://tio.run/##KypNqvz/v0AhPbWkWK8kPz5T2/D/fwA',
    timestamp: '2021-01-24T19:36:38.319+00:00',
    result: correctResultForManyPeople(2),
    notes: { score: 7 },
  },
  {
    name: 'C',
    isLate: false,
    questionNum,
    submission: 'https://tio.run/##KypNqvz/v0AhPbWkWK8kPz5T2/D/fwA',
    timestamp: '2021-01-24T19:36:38.319+00:00',
    result: correctResultForManyPeople(3),
    notes: { score: 6 },
  },
  {
    name: 'D',
    isLate: false,
    questionNum,
    submission: 'https://tio.run/##KypNqvz/v0AhPbWkWK8kPz5T2/D/fwA',
    timestamp: '2021-01-24T19:36:38.319+00:00',
    result: correctResultForManyPeople(4),
    notes: { score: 5 },
  },
  // Yes, E is supposed to be missing
  {
    name: 'F',
    isLate: false,
    questionNum,
    submission: 'https://tio.run/##KypNqvz/v0AhPbWkWK8kPz5T2/D/fwA',
    timestamp: '2021-01-24T19:36:38.319+00:00',
    result: correctResultForManyPeople(5),
    notes: { score: 4 },
  },
  {
    name: 'G',
    isLate: false,
    questionNum,
    submission: 'https://tio.run/##KypNqvz/v0AhPbWkWK8kPz5T2/D/fwA',
    timestamp: '2021-01-24T19:36:38.319+00:00',
    result: correctResultForManyPeople(6),
    notes: { score: 4 },
  },
  {
    name: 'H',
    isLate: false,
    questionNum,
    submission: 'https://tio.run/##KypNqvz/v0AhPbWkWK8kPz5T2/D/fwA',
    timestamp: '2021-01-24T19:36:38.319+00:00',
    result: correctResultForManyPeople(7),
    notes: { score: 4 },
  },
  {
    name: 'I',
    isLate: false,
    questionNum,
    submission: 'https://tio.run/##KypNqvz/v0AhPbWkWK8kPz5T2/D/fwA',
    timestamp: '2021-01-24T19:36:38.319+00:00',
    result: correctResultForManyPeople(8),
    notes: { score: 4 },
  },
  {
    name: 'I',
    isLate: false,
    questionNum,
    submission: 'https://tio.run/##KypNqvz/v0AhPbWkWK8kPz5T2/D/fwA',
    timestamp: '2021-01-24T18:00:00+00:00',
    result: correctResultForManyPeople(50),
    // outdated
    notes: { score: 0 },
  },
  {
    name: 'I',
    isLate: false,
    questionNum,
    submission: 'https://tio.run/##KypNqvz/v0AhPbWkWK8kPz5T2/D/fwA',
    timestamp: '2021-01-24T18:30:00+00:00',
    result: null,
    // incorrect & outdated
    notes: { score: 0 },
  },
  {
    name: 'J',
    isLate: false,
    questionNum,
    submission: 'https://tio.run/##KypNqvz/v0AhPbWkWK8kPz5T2/D/fwA',
    timestamp: '2021-01-24T19:36:38.319+00:00',
    result: null,
    // incorrect
    notes: { score: 0 },
  },
]

// prettier-ignore
const submissions = [
  ...submissions1(1),
  ...submissions1(2),
  ...submissionsManyPeople(3),
]

for (const s of submissions) {
  s._id = Math.random() < 0.5 ? nanoid() : new ObjectId()
}

test('score', () => {
  const scored = score(submissions, globals)

  expect(scored).toHaveLength(submissions.length)

  for (const submission of submissions) {
    const scoredSubmission = scored.find(({ _id }) => _id === submission._id)

    expect(scoredSubmission).toEqual(expect.objectContaining(submission.notes))
  }
})

test('scoreSubmissions for person', () => {
  const names = [...new Set(submissions.map((s) => s.name))]

  for (const name of names) {
    const scored = score(submissions, globals, name)

    const filteredSubmissions = submissions.filter((s) => s.name === name)

    expect(scored).toHaveLength(filteredSubmissions.length)

    for (const submission of filteredSubmissions) {
      const scoredSubmission = scored.find(({ _id }) => _id === submission._id)

      switch (scoredSubmission.questionNum) {
        case 1:
          expect(scoredSubmission).toEqual(
            expect.objectContaining(submission.notes),
          )
          break
        case 2:
        case 3:
          expect(scoredSubmission.score).not.toBeDefined()
          if (submission.result) {
            expect(scoredSubmission.result).toEqual({
              ...scoredSubmission.result,
              inputsOutputs: undefined,
            })
          }
          expect(scoredSubmission.correctness).not.toBeDefined()
          expect(scoredSubmission.overrideIsCorrect).not.toBeDefined()
          break
        default:
          fail(`question num ${scoredSubmission.questionNum} not expected`)
      }
    }
  }
})

describe('rankings', () => {
  test('uncensored', () => {
    expect(getPeopleRankings(submissions, globals, false)).toEqual([
      { name: 'C', score: 7 + 7 + 6, ranking: 1 },
      { name: 'E', score: 8 + 8 + 0, ranking: 2 },
      { name: 'A', score: 0 + 0 + 8, ranking: 3 },
      { name: 'B', score: 0 + 0 + 7, ranking: 4 },
      { name: 'D', score: 0 + 0 + 5, ranking: 5 },
      { name: 'F', score: 0 + 0 + 4, ranking: 6 },
      { name: 'G', score: 0 + 0 + 4, ranking: 6 },
      { name: 'H', score: 0 + 0 + 4, ranking: 6 },
      { name: 'I', score: 0 + 0 + 4, ranking: 6 },
    ])
  })
  test('censored', () => {
    expect(getPeopleRankings(submissions, globals, true)).toEqual([
      { name: 'E', score: 8, ranking: 1 },
      { name: 'C', score: 7, ranking: 2 },
    ])
  })
})
