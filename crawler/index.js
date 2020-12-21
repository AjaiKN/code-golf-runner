// @ts-check

const { Builder, By, until } = require('selenium-webdriver')

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

  const driver = await new Builder().forBrowser('safari').build()
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

// ;(async () => {
//   console.log(
//     await getStuff(
//       // 'https://tio.run/##KypNqvz/v6C0pFgjPbWkWK8kPz5TQVvBUPP/f@P/ef/yC0oy8/OK/6f9LwIA',
//       'https://tio.run/dfsajkdsa',
//       ['5\n', '6\n', '7\n'],
//     ),
//   )
// })()

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const axios = require('axios').default
axios.defaults.baseURL = process.env.SERVER_URL

const password = process.env.PASSWORD

async function checkForAndRunSubmissions() {
  /** @type {{submissions: {_id: string, submission: string}[], inputs: string[]}} */
  const { submissions, inputs } = (
    await axios.get('/testsneeded', { params: { password } })
  ).data
  console.log(`testing ids: ` + submissions.map((s) => s._id))
  const promises = submissions.map(async ({ _id, submission }) => {
    const result = await getStuff(submission, inputs)
    console.log({ _id, result })
    await axios.post('/testresult', {
      _id,
      result,
      password,
    })
    console.log('done posting')
  })
  await Promise.all(promises)
  setTimeout(() => {
    checkForAndRunSubmissions()
  }, 2000)
}
checkForAndRunSubmissions()
