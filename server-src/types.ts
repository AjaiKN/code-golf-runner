import { ObjectId } from 'mongodb'

export interface InputOutput {
  input: string
  output: string
}

interface QuestionInputOutput extends InputOutput {
  isGivenExample: boolean
}

type QuestionStatus = 'notStarted' | 'started' | 'finished'

export interface Question {
  questionNum: number
  status: QuestionStatus
  text: string
  inputsOutputs: QuestionInputOutput[]
}

export interface Globals {
  introduction: string
  questions: Question[]
}

export interface ResultInputOutput extends InputOutput {
  debug: string
}

export interface AnnotatedResultInputOutput extends ResultInputOutput {
  expectedOutput: string
  isCorrect: boolean
}

export interface Result {
  lang: string
  code: string
  inputsOutputs: ResultInputOutput[]
  header: null | string
  footer: null | string
  commandLineOptions: string[]
  commandLineArguments: string[]
}

export interface AnnotatedResult extends Result {
  inputsOutputs: AnnotatedResultInputOutput[]
}

export interface Submission {
  _id?: string | ObjectId
  name: string
  /** submission URL */
  submission: string
  timestamp: string | Date
  result?: Result | null | undefined
  overrideIsCorrect?: boolean
  isLate: boolean
  questionNum: number
  /** for humans and tests */
  notes?: any
}

export interface Correctness {
  correct: boolean | null
  reason?: string
}

export interface AnnotatedSubmission extends Submission {
  result?: AnnotatedResult | null | undefined
  correctness: Correctness
}

export interface OutdatableAnnotatedSubmission extends AnnotatedSubmission {
  isOutdated: boolean
}

export interface ScoredSubmission extends OutdatableAnnotatedSubmission {
  score: number
}

export interface Ranking {
  ranking: number
  name: string
  score: number
}
