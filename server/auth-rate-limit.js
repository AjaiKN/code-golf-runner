// Limit auth so that only 50 logins can happen per second (i.e. once per 20ms)

let lastAuthed = Date.now()

function sleep(/** @type number */ milliseconds) {
  console.log('sleeping')
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

module.exports.limitRate = async function limitRate() {
  while (Date.now() - lastAuthed <= 20) {
    await sleep(7)
  }
  lastAuthed = Date.now()
}
