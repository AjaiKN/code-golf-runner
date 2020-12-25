import {
  createApp,
  ref,
  computed,
} from 'https://unpkg.com/vue@3.0.4/dist/vue.esm-browser.js'
// import { exampleSubmission } from './example-submission.js'
import { useWebsocket } from './get-post.js'
import { SubmissionsTable, ShowConnectivity } from './view-submission.js'

const app = createApp({
  components: { SubmissionsTable, ShowConnectivity },
  setup() {
    const error = ref()

    const adminInfo = ref()

    const { isConnected, send } = useWebsocket('/admin', {
      onConnect: () => {
        send({ type: 'auth', password: window.location.hash.substring(1) })
      },
      onMessage: {
        update: (message) => (adminInfo.value = message),
      },
    })

    return {
      adminInfo,
      submissions: computed(() => adminInfo.value?.submissions),
      error,
      log: (a) => {
        console.log(a)
        return a
      },
      isConnected,
    }
  },
})

app.mount('#app')
