import {
  createApp,
  ref,
  reactive,
  computed,
  watchEffect,
} from 'https://unpkg.com/vue@3.0.4/dist/vue.esm-browser.js'
import { nanoid } from 'https://cdn.skypack.dev/pin/nanoid@v3.1.20-dsnQAVooO9DnkpQkIpbq/min/nanoid.js'
import { get, post, useWebsocket } from './get-post.js'
import { throttle } from './throttle.js'
import { GolferSubmissionsTable, ShowConnectivity } from './view-submission.js'
import { useLocalStorageRef } from './use-local-storage-ref.js'

function getMarkdownHtml(markdownStr) {
  const html = marked(markdownStr)
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
}

const LoginForm = {
  name: 'login-form',
  props: {
    name: String,
    secretPhrase: String,
    showSecretPhraseInput: Boolean,
    isSubmittingForm: Boolean,
  },
  emits: ['submit', 'update:showSecretPhraseInput'],
  setup(props, { emit }) {
    const myName = ref(props.name)
    const mySecretPhrase = ref(props.secretPhrase)

    function submit() {
      emit('submit', { name: myName.value, secretPhrase: mySecretPhrase.value })
    }

    return { myName, mySecretPhrase, submit }
  },
  template: /* HTML */ `
    <div class="login">
      Please use your actual name. You won't be able to change it later.
      <form @submit.prevent="submit">
        <div>
          <label for="name">Name:</label>
          <input
            required
            id="name"
            name="name"
            :readonly="isSubmittingForm || showSecretPhraseInput"
            v-model="myName"
          />
          <button
            v-if="showSecretPhraseInput"
            class="edit-button"
            :disabled="isSubmittingForm"
            type="button"
            @click="$emit('update:showSecretPhraseInput', false)"
          >
            Log into different name
          </button>
        </div>
        <div>
          <label v-if="showSecretPhraseInput">
            Secret Phrase:
            <input
              required
              :readonly="isSubmittingForm"
              v-model="mySecretPhrase"
            />
          </label>
        </div>
        <button class="submit-button">Log in</button>
      </form>
      <p v-if="isSubmittingForm">Submitting form...</p>
    </div>
  `,
}

// function actuallySubmitForm(form) {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       if (Math.random() < 0.5) resolve({ timestamp: new Date() })
//       else reject()
//     }, 1000)
//   })
// }

createApp({
  components: { GolferSubmissionsTable, LoginForm, ShowConnectivity },
  setup() {
    const auth = useLocalStorageRef('auth', { name: '', secretPhrase: '' })

    // {type: 'loading'}
    // {type: 'login', showSecretPhraseInput: false, isSubmittingForm: boolean}
    // {type: 'login', showSecretPhraseInput: true, isSubmittingForm: boolean}
    // {type: 'authenticated'}
    const authStatus = ref({ type: 'loading' })

    const text = ref('')

    function submit() {
      if (
        !/^(https?:\/\/)?(tryitonline\.net|tio\.run)\//.test(text.value) &&
        !window.confirm(
          "This doesn't look like a tio.run link. Are you sure you want to submit it?",
        )
      ) {
        return
      }
      const formToSubmit = reactive({
        id: nanoid(),
        text: text.value,
      })
      text.value = ''
      post('/submission', {
        ...auth.value,
        submission: formToSubmit.text,
      })
    }

    const markdownDescription = ref(null)

    const submittedForms = ref()

    const { send, isConnected } = useWebsocket('/golfer', {
      onConnect: () => {
        send({ type: 'auth', ...auth.value })
      },
      onMessage: {
        'update:globals'({ globals }) {
          markdownDescription.value = globals.introduction
        },
        'update:submissions'({ submissions }) {
          submittedForms.value = submissions.reverse()
        },
        authenticated(authInfo) {
          authStatus.value.isSubmittingForm = false
          auth.value = authInfo
          authStatus.value = { type: 'authenticated' }
        },
        needLogin() {
          authStatus.value.isSubmittingForm = false
          authStatus.value = { type: 'login', showSecretPhraseInput: false }
        },
        needSecretPhrase() {
          authStatus.value.isSubmittingForm = false
          if (
            authStatus.value.type === 'login' &&
            authStatus.value.showSecretPhraseInput
          ) {
            alert('incorrect name or phrase')
          }
          authStatus.value = { type: 'login', showSecretPhraseInput: true }
        },
      },
    })

    function submitLogin(login) {
      console.log({ submitting: true, login })
      auth.value = login
      authStatus.value.isSubmittingForm = true
      send({ type: 'auth', ...auth.value })
    }

    return {
      theHtmlDescription: computed(
        () =>
          markdownDescription.value &&
          getMarkdownHtml(markdownDescription.value),
      ),
      submit,
      text,
      submittedForms,
      auth,
      authStatus,
      submitLogin,
      isConnected,
      logOut: () => {
        if (
          window.confirm(
            `Are you sure you want to log out? Make sure to write down your secret phrase first: ${auth?.value?.secretPhrase}.`,
          )
        ) {
          auth.value = { name: '', secretPhrase: '' }
          send({ type: 'auth', ...auth.value })
          authStatus.value.isSubmittingForm = false
          authStatus.value = { type: 'login', showSecretPhraseInput: false }
        }
      },
    }
  },
}).mount('#app')
