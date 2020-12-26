<template>
  <show-connectivity :is-connected="isConnected"></show-connectivity>

  <div v-if="authStatus.type === 'loading'">Loading description...</div>

  <div v-else-if="authStatus.type === 'login'">
    <login-form
      :name="auth.name"
      :secret-phrase="auth.secretPhrase"
      v-model:show-secret-phrase-input="authStatus.showSecretPhraseInput"
      :is-submitting-form="authStatus.isSubmittingForm"
      @submit="submitLogin($event)"
    ></login-form>
  </div>

  <div v-else-if="theHtmlDescription && submittedForms">
    <teleport to="#top-right">
      <div style="text-align: right">
        <button @click="logOut">Log out</button>
      </div>
    </teleport>

    <h1>Welcome to TechOlympics Code Golf, {{ auth.name }}!</h1>

    <!-- prettier-ignore -->
    <p>
        Your secret phrase is <b>{{auth.secretPhrase}}</b>. Write it down!
      </p>

    <div v-if="theHtmlDescription" v-html="theHtmlDescription"></div>

    <div class="submission">
      <form @submit.prevent="submit">
        <label>
          Tio.Run Link:
          <input v-model="text" required />
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>

    <golfer-submissions-table
      v-if="submittedForms"
      :submitted-forms="submittedForms"
    ></golfer-submissions-table>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, Ref, ref, watchEffect } from 'vue'
import { nanoid } from 'nanoid'
import { post, useWebsocket } from '../http'
import GolferSubmissionsTable from '../components/GolferSubmissionsTable.vue'
import LoginForm from '../components/LoginForm.vue'
import ShowConnectivity from '../components/ShowConnectivity.vue'
import { useLocalStorageRef } from '../useLocalStorageRef'
import { getMarkdownHtml } from '../getMarkdownHtml'

type AuthStatus =
  | { type: 'loading' }
  | { type: 'login'; showSecretPhraseInput: boolean; isSubmittingForm: boolean }
  | { type: 'authenticated' }

export default defineComponent({
  components: { GolferSubmissionsTable, LoginForm, ShowConnectivity },
  setup() {
    const auth = useLocalStorageRef('auth', { name: '', secretPhrase: '' })

    const authStatus = ref<AuthStatus>({ type: 'loading' })
    watchEffect(() => console.log(JSON.stringify(authStatus.value)))

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
          if (authStatus.value.type === 'login')
            authStatus.value.isSubmittingForm = false
          auth.value = authInfo
          authStatus.value = { type: 'authenticated' }
        },
        needLogin() {
          if (authStatus.value.type === 'login')
            authStatus.value.isSubmittingForm = false
          authStatus.value = {
            type: 'login',
            showSecretPhraseInput: false,
            isSubmittingForm: false,
          }
        },
        needSecretPhrase() {
          if (authStatus.value.type === 'login')
            authStatus.value.isSubmittingForm = false
          if (
            authStatus.value.type === 'login' &&
            authStatus.value.showSecretPhraseInput
          ) {
            alert('incorrect name or phrase')
          }
          authStatus.value = {
            type: 'login',
            showSecretPhraseInput: true,
            isSubmittingForm: false,
          }
        },
      },
    })

    function submitLogin(login: any) {
      console.log({ submitting: true, login })
      auth.value = login
      if (authStatus.value.type === 'login')
        authStatus.value.isSubmittingForm = true
      send({ type: 'auth', ...auth.value })
    }

    return {
      theHtmlDescription: computed(
        () =>
          markdownDescription.value &&
          getMarkdownHtml(markdownDescription.value!),
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
          if (authStatus.value.type === 'login')
            authStatus.value.isSubmittingForm = false
          authStatus.value = {
            type: 'login',
            showSecretPhraseInput: false,
            isSubmittingForm: false,
          }
        }
      },
    }
  },
})
</script>
