import produce from 'immer'
import type {
  AnnotatedSubmission,
  Correctness,
  Globals,
  OutdatableAnnotatedSubmission,
  Question,
  Ranking,
  ScoredSubmission,
  Submission,
} from './types'

function trimAllLines(str: string): string {
  return str
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .join('\n')
}

export function normalizeInput(str: string) {
  return trimAllLines(str) + '\n'
}

/** Evaluate whether a submission is correct and the reason why */
function isCorrect(
  submission: AnnotatedSubmission,
  question: Question,
): Correctness {
  const { overrideIsCorrect, isLate, result } = submission

  if (overrideIsCorrect != null)
    return {
      correct: submission.overrideIsCorrect,
      reason: 'overriden by admin',
    }

  if (isLate) return { correct: false, reason: 'submitted late' }

  if (result === undefined)
    return { correct: null, reason: 'still evaluating...' }
  if (result === null)
    return {
      correct: false,
      reason: 'unable to evaluate (probably a bad link)',
    }

  if (result.header != null)
    return { correct: false, reason: 'non-blank header' }
  if (result.footer != null)
    return { correct: false, reason: 'non-blank footer' }
  if (result.commandLineOptions.length > 0)
    return { correct: false, reason: 'non-blank command line options' }
  if (result.commandLineArguments.length > 0)
    return { correct: false, reason: 'non-blank command line arguments' }

  const submissionInputsOutputs = result.inputsOutputs

  const questionInputsOutputs = question.inputsOutputs

  for (const { input } of questionInputsOutputs) {
    const submissionInputOutput = submissionInputsOutputs.find(
      (s) => normalizeInput(s.input) === normalizeInput(input),
    )
    if (submissionInputOutput == null)
      return {
        correct: false,
        reason: 'not all test cases were tested',
      }
    if (!submissionInputOutput.isCorrect)
      return {
        correct: false,
        reason: 'gave incorrect outputs for at least 1 test case',
      }
  }

  return { correct: true, reason: 'correct' }
}

/** Annotate a submission by adding the correctness and marking which inputs/outputs are correct */
export function annotateSubmission(
  originalSubmission: Submission,
  questions: Question[],
): AnnotatedSubmission {
  return produce(originalSubmission as AnnotatedSubmission, (submission) => {
    const question = questions.find(
      (q) => q.questionNum === submission.questionNum,
    )

    if (submission.result?.inputsOutputs) {
      for (const { input, output: expectedOutput } of question.inputsOutputs) {
        const submissionInputOutput = submission.result.inputsOutputs.find(
          (s) => normalizeInput(s.input) === normalizeInput(input),
        )

        if (submissionInputOutput == null) continue

        const { output: submittedOutput, debug } = submissionInputOutput

        submissionInputOutput.expectedOutput = expectedOutput

        submissionInputOutput.isCorrect =
          trimAllLines(submittedOutput) === trimAllLines(expectedOutput)
      }
    }

    submission.correctness = isCorrect(submission, question)

    return submission
  })
}

/** Annotate a submission, except return null if the question isn't over yet */
function censorSubmission(
  scoredSubmission: ScoredSubmission,
  questions: Question[],
) {
  const question = questions.find(
    (q) => q.questionNum === scoredSubmission.questionNum,
  )
  return produce(scoredSubmission, (draft) => {
    if (question.status !== 'finished') {
      delete draft.correctness
      delete draft.overrideIsCorrect
      delete draft.score
      if (draft.result) delete draft.result.inputsOutputs
    }
  })
}

/** Remove a question if it hasn't started, and
 * remove the expected outputs from a question if it isn't finished */
function censorQuestion(question: Question): null | Question {
  switch (question.status) {
    case 'notStarted':
      return null
    case 'started':
      return {
        ...question,
        inputsOutputs: question.inputsOutputs.filter(
          (inputOutput) => inputOutput.isGivenExample,
        ),
      }
    case 'finished':
      return question
  }
}

export function censorGlobals(globals: Globals): Globals {
  return {
    ...globals,
    questions: globals.questions.map(censorQuestion).filter((q) => q != null),
  }
}

function getScoreFromPlaceAssumingCorrect(place: number) {
  // prettier-ignore
  switch (place) {
    case 1:  return 8
    case 2:  return 7
    case 3:  return 6
    case 4:  return 5
    default: return 4
  }
}

// TODO: categories:
// 1. correct
// 2. incorrect
// 3. not yet graded
// 4. outdated (there's a newer submission by this person)
// 5. late

// assumes they're all for the same question
function scoreSubmissionsForQuestion(
  annotatedSubmissions: OutdatableAnnotatedSubmission[],
): ScoredSubmission[] {
  // TODO: score override
  const sorted = annotatedSubmissions.sort((s1, s2) => {
    if (s1.correctness.correct && !s2.correctness.correct) return -1
    if (!s1.correctness.correct && s2.correctness.correct) return +1
    let ret = 0
    if (s1.result?.codeBytes != null && s2.result?.codeBytes != null) {
      ret = s1.result.codeBytes - s2.result.codeBytes
    }
    if (ret !== 0) return ret
    ret = new Date(s1.timestamp).getTime() - new Date(s2.timestamp).getTime()
    return ret
  })

  const scored = sorted.map((submission, index) => {
    const place = submission.correctness.correct ? index + 1 : null
    const score =
      place == null ? 0 : getScoreFromPlaceAssumingCorrect(index + 1)
    return { ...submission, score }
  })

  return scored
}

// assumes they're all for the same question
function markOutdatedSubmissionsForQuestion(
  annotatedSubmissions: AnnotatedSubmission[],
): OutdatableAnnotatedSubmission[] {
  return annotatedSubmissions.map((submission) => {
    if (isNaN(new Date(submission.timestamp).getTime()))
      console.error(`invalid timestamp: ${submission.timestamp}`)

    const laterOnTimeSubmissionsByThisPerson = annotatedSubmissions.filter(
      (s) =>
        s.name === submission.name &&
        !s.isLate &&
        s._id.toString() !== submission._id.toString() &&
        new Date(s.timestamp).getTime() >
          new Date(submission.timestamp).getTime(),
    )

    const isOutdated = laterOnTimeSubmissionsByThisPerson.length > 0

    const ret = {
      ...submission,
      isOutdated,
    }

    if (isOutdated) {
      ret.correctness = {
        correct: false,
        reason: "outdated (there's a newer, on-time submission)",
      }
    }

    return ret
  })
}

function scoreSubmissions(
  annotatedSubmissions: AnnotatedSubmission[],
  globals: Globals,
  censorUnfinishedQuestionsForRanking = false,
): ScoredSubmission[] {
  let questionNums = globals.questions
    .filter(
      (q) => !censorUnfinishedQuestionsForRanking || q.status === 'finished',
    )
    .map((q) => q.questionNum)
  return questionNums.flatMap((questionNum) =>
    scoreSubmissionsForQuestion(
      markOutdatedSubmissionsForQuestion(
        annotatedSubmissions.filter((s) => s.questionNum === questionNum),
      ),
    ),
  )
}

export function score(
  submissions: Submission[],
  globals: Globals,
  golferName?: string,
) {
  const shouldCensor = golferName != null
  const annotated = submissions.map((s) =>
    annotateSubmission(s, globals.questions),
  )

  let scored = scoreSubmissions(annotated, globals)

  if (shouldCensor) {
    scored = scored
      .filter((s) => s.name === golferName)
      .map((s) => censorSubmission(s, globals.questions))
  }

  return scored
}

export function getPeopleRankings(
  submissions: Submission[],
  globals: Globals,
  censorUnfinishedQuestions: boolean,
): Ranking[] {
  const scoredSubmissions = scoreSubmissions(
    submissions.map((s) => annotateSubmission(s, globals.questions)),
    globals,
    censorUnfinishedQuestions,
  )

  const scores: Record<string, number> = {}
  for (const s of scoredSubmissions) {
    const currentScore = scores[s.name] ?? 0
    scores[s.name] = currentScore + s.score
  }
  const ret = Object.entries(scores)
    .map(([name, score]) => ({ name, score, ranking: 0 }))
    .sort((a, b) => b.score - a.score)

  let previousScore: number
  let ranking = 0
  for (const thing of ret) {
    if (thing.score !== previousScore) ranking++
    thing.ranking = ranking
    previousScore = thing.score
  }

  return ret.filter(({ score }) => score !== 0)
}
