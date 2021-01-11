// @ts-check

const _ = require('lodash')
const { Builder, By, until } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')

const WAIT_TIME = 10000

async function getStuff(
  /** @type {string} */ url,
  /** @type {string[]} */ inputs,
) {
  let ret = null

  if (!url.startsWith('https://tio.run/')) {
    url = url.replace(
      /^(https?:\/\/)?(tryitonline\.net|tio\.run)\//,
      'https://tio.run/',
    )
    if (!url.startsWith('https://tio.run/')) return null
  }

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(
      new chrome.Options().headless().windowSize({ width: 640, height: 480 }),
    )
    .build()
  try {
    await driver.get(url)

    async function getValueOfId(/** @type {string} */ id, attribute = 'value') {
      const el = await driver.findElement(By.id(id))
      if (!(await el.isDisplayed())) return null
      return await el.getAttribute(attribute)
    }

    async function putInput(/** @type {string} */ input) {
      // wait until not running
      await driver.wait(
        until.elementLocated(By.css('#run:not(.running)')),
        WAIT_TIME,
      )
      // input
      const inputEl = await driver.findElement(By.id('input'))
      if (!(await inputEl.isDisplayed())) {
        await (
          await driver.findElement(By.css('label[for="toggle-input"]'))
        ).click()
        await driver.wait(until.elementIsVisible(inputEl))
      }
      await inputEl.clear()
      await inputEl.sendKeys(input)
      // wait until run button exists
      await driver.wait(until.elementsLocated(By.id('run')), WAIT_TIME)
      // click run button
      await (await driver.findElement(By.id('run'))).click()
      // wait until it's running
      await driver.wait(until.elementLocated(By.css('#run.running')), WAIT_TIME)
      // wait until it's done running
      await driver.wait(
        until.elementLocated(By.css('#run:not(.running)')),
        WAIT_TIME,
      )

      return {
        input: await getValueOfId('input'),
        output: await getValueOfId('output'),
        debug: await getValueOfId('debug'),
      }
    }

    async function getOptions(/** @type {string} */ id) {
      const els = await driver.findElements(By.css(`#${id} textarea`))
      const ret = []
      for (const el of els) {
        if (el.isDisplayed()) {
          ret.push(await el.getAttribute('value'))
        }
      }
      return ret
    }

    async function putInputs(/** @type {string[]} */ inputs) {
      const ret = []
      for (const input of inputs) {
        ret.push(await putInput(input))
      }
      return ret
    }

    const inputsOutputs = await putInputs(inputs)

    ret = {
      lang: await getValueOfId('lang-name', 'textContent'),
      code: await getValueOfId('code'),
      inputsOutputs,

      // shouldn't exist, should be null
      header: await getValueOfId('header'),
      footer: await getValueOfId('footer'),
      commandLineOptions: await getOptions('option-wrapper'),
      commandLineArguments: await getOptions('cla-wrapper'),
    }
  } catch (e) {
    console.error(e)
    // returns null because ret wasn't assigned to
  } finally {
    driver.quit()
  }
  return ret
}

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

let isRunningSelenium = false

// ;(async () => {
//   console.log(
//     await getStuff(
//       'https://tio.run/##KypNqvz/v6C0pFgjPbWkWK8kPz5TQVvBUPP/f@P/ef/yC0oy8/OK/6f9LwIA',
//       // 'https://tio.run/dfsajkdsa',
//       ['5\n', '6\n', '7\n'],
//     ),
//   )
// })()

const WebSocket = require('ws')

/** @type {WebSocket} */
let socket

const disconnected = _.throttle(() => {
  console.log('disconnected')
  setTimeout(() => {
    if (socket.readyState !== WebSocket.OPEN) {
      console.log('attempting to reconnect')
      socket.close()
      connectWebsocket()
    }
  }, 2000)
}, 2000)

function connectWebsocket() {
  socket = new WebSocket(process.env.SERVER_URL + '/crawler', {
    headers: { password: process.env.PASSWORD },
  })

  let submissions = []
  const submissionsTodo = () => submissions.filter((s) => !s.doneRunning)

  socket.on('open', () => {
    console.log('socket open')
  })

  socket.on('close', disconnected)
  socket.on('error', disconnected)

  socket.on('message', async (dataUnparsed) => {
    const data = JSON.parse(dataUnparsed.toString())
    if (data.type === 'update') {
      const receivedSubmissions = data.submissions
      console.log('received')

      submissions = submissions.concat(
        receivedSubmissions.filter(
          (s) => !submissions.find((s2) => s2._id === s._id),
        ),
      )

      if (isRunningSelenium) return

      isRunningSelenium = true
      while (submissionsTodo().length > 0) {
        console.log('starting')
        const currentSubmission = submissionsTodo()[0]
        const { submission, inputs, _id } = currentSubmission
        const result = await getStuff(submission, inputs)
        console.log({ _id, result })
        socket.send(JSON.stringify({ type: 'testresult', _id, result }))
        console.log('ending')
        currentSubmission.doneRunning = true
        await sleep(100)
      }
      isRunningSelenium = false
      console.log('done')
    }
  })
}
connectWebsocket()
