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

  <div v-else-if="markdownDescription && submittedForms">
    <golf-main
      :auth="auth"
      :markdown-description="markdownDescription"
      :submitted-forms="submittedForms"
    />
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, h, ref, watchEffect } from 'vue'
import { useWebsocket } from '../http'
import LoginForm from '../components/LoginForm.vue'
import ShowConnectivity from '../components/ShowConnectivity.vue'
import { useLocalStorageRef } from '../useLocalStorageRef'

type AuthStatus =
  | { type: 'loading' }
  | { type: 'login'; showSecretPhraseInput: boolean; isSubmittingForm: boolean }
  | { type: 'authenticated' }

const GolfMainComponentPromise = import('../components/GolfMain.vue')

export default defineComponent({
  components: {
    LoginForm,
    ShowConnectivity,
    GolfMain: defineAsyncComponent({
      loader: () => GolfMainComponentPromise,
      loadingComponent: () => h('p', 'Loading...'),
      errorComponent: () =>
        h('p', 'There was an error fetching the GolfMain component'),
      timeout: 4000,
      onError(error, retry, fail, attempts) {
        if (error.message.match(/fetch/) && attempts <= 3) {
          // retry on fetch errors, 3 max attempts
          retry()
        } else {
          fail()
        }
      },
    }),
  },
  setup() {
    const auth = useLocalStorageRef('auth', { name: '', secretPhrase: '' })

    const authStatus = ref<AuthStatus>({ type: 'loading' })
    watchEffect(() => console.log(JSON.stringify(authStatus.value)))

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

    function logOut() {
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
    }

    return {
      markdownDescription,
      submittedForms,
      auth,
      authStatus,
      submitLogin,
      isConnected,
      logOut,
    }
  },
})
</script>
