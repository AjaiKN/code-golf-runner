// Note: crypto.random is only available in Node >=14.10

const fs = require('fs/promises')
const { getHeapSnapshot } = require('v8')
const randomInt = require('util').promisify(require('crypto').randomInt)

const wordsPromise = fs
  .readFile('./eff_large_wordlist.txt', 'utf8')
  .then((str) => str.split('\n'))

const PHRASE_LENGTH = 4

module.exports.genSecretPhrase = async () => {
  const words = await wordsPromise

  async function genRandomWord() {
    const index = await randomInt(words.length)
    return words[index]
  }

  const wordsChosen = await Promise.all(
    [...Array(PHRASE_LENGTH)].map(genRandomWord),
  )

  return wordsChosen.join('-')
}
