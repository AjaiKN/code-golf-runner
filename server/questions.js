// This is just a file for notes

const questions = [
  {
    _id: 1,
    question: 'fadkjfkasdjkfjakdjfkjak markdown',
    // option 1
    show: true,
    isCompleted: false,
    // option 2: nothing
  },
  { _id: 2 },
  { _id: 3 },
  { _id: 4 },
]

// option 1
let currentQuestion = 3

// option 2
const questionState = {
  currentQuestion: 3,
  isCompleted: false,
}

// I think option 2 is better

function shouldShowQuestion(n) {
  return n <= questionState.currentQuestion
}

function shouldShowAnswer(n) {
  if (questionState.isCompleted) {
    return n <= questionState.currentQuestion
  } else {
    return n < questionState.currentQuestion
  }
}
