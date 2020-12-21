import {
  createApp,
  ref,
  computed,
} from 'https://unpkg.com/vue@3.0.4/dist/vue.esm-browser.js'
// import { exampleSubmission } from './example-submission.js'
import { get } from './get-post.js'
import { SubmissionsTable } from './view-submission.js'

const app = createApp({
  components: { SubmissionsTable },
  setup() {
    const password = window.location.hash.substring(1)

    const error = ref()

    const adminInfo = ref()

    const getAdminInfo = () =>
      get(`/admininfo?password=${password}`)
        .then((s) => {
          error.value = undefined
          adminInfo.value = s
        })
        .catch((e) => (error.value = e.message))
    getAdminInfo()
    setInterval(getAdminInfo, 2000)

    return {
      adminInfo,
      submissions: computed(() => adminInfo.value?.submissions),
      error,
      log: (a) => {
        console.log(a)
        return a
      },
    }
  },
})

app.mount('#app')
