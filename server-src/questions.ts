import produce from 'immer'
import type {
  AnnotatedSubmission,
  Correctness,
  Globals,
  Question,
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
function annotateAndCensorSubmission(
  originalSubmission: Submission,
  questions: Question[],
) {
  const annotated = annotateSubmission(originalSubmission, questions)
  const question = questions.find(
    (q) => q.questionNum === annotated.questionNum,
  )
  return produce(annotated, (draft) => {
    if (question.status !== 'finished') {
      delete draft.correctness
      delete draft.overrideIsCorrect
      if (draft.result) delete draft.result.inputsOutputs
    }
  })
}

/** Returns the annotated versions of the submissions,
 * except only the ones where the questions are finished */
export function annotateAndCensorSubmissions(
  submissions: Submission[],
  globals: Globals,
  name: string,
) {
  return submissions
    .filter((s) => s.name === name)
    .map((s) => annotateAndCensorSubmission(s, globals.questions))
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
