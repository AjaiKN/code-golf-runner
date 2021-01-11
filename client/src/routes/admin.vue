<template>
  <ShowConnectivity :is-connected="isConnected" />

  <AdminQuestionStatusControl v-if="globals" v-model:globals="globals" />

  <div style="display: flex; align-items: center">
    <span>Question:&nbsp;</span>
    <QuestionSelection
      v-if="currentQuestionNum"
      v-model:currentQuestionNum="currentQuestionNum"
      :questionNums="questionNums"
    />
  </div>

  <pre v-if="error">{{ error }}</pre>

  <p v-else-if="!adminInfo">Loading...</p>

  <div v-else>
    <h1 style="margin-bottom: 0.4rem">Code Golf Results</h1>
    <p>Click on a row to view more details.</p>

    <SubmissionAdmin :submissions="filteredSubmissions" />
  </div>
</template>

<script lang="ts">
import { debounce } from 'lodash-es'
import { computed, defineComponent, ref, watchEffect } from 'vue'
import type { AnnotatedSubmission } from '../../../server/types'
import AdminQuestionStatusControl from '../components/AdminQuestionStatusControl.vue'
import QuestionSelection from '../components/QuestionSelection.vue'
import ShowConnectivity from '../components/ShowConnectivity.vue'
import SubmissionAdmin from '../components/SubmissionAdmin.vue'
import { useWebsocket } from '../http'
import { useCurrentQuestionNum } from '../useCurrentQuestionNum'

export default defineComponent({
  components: {
    SubmissionAdmin,
    ShowConnectivity,
    AdminQuestionStatusControl,
    QuestionSelection,
  },
  setup() {
    const error = ref()

    const adminInfo = ref<{ submissions: AnnotatedSubmission[] }>()

    const globals = ref()

    const { isConnected, send } = useWebsocket('/admin', {
      onConnect: () => {
        send({ type: 'auth', password: window.location.hash.substring(1) })
      },
      onMessage: {
        update: (message) => (adminInfo.value = message),
        'update:globals': (message) => (globals.value = message.globals),
      },
    })

    const questionNums = computed<number[] | undefined>(
      () =>
        globals.value && globals.value.questions.map((q: any) => q.questionNum),
    )
    const { currentQuestionNum } = useCurrentQuestionNum(questionNums, {
      isAdmin: true,
    })

    const filteredSubmissions = computed(
      () =>
        adminInfo.value?.submissions &&
        adminInfo.value.submissions
          .reverse()
          .filter((s) => s.questionNum === currentQuestionNum.value),
    )

    return {
      adminInfo,
      submissions: computed(() => adminInfo.value?.submissions),
      error,
      isConnected,
      globals: computed({
        get: () => globals.value,
        set: (newGlobals) => {
          globals.value = globals.value
          send({ type: 'update:globals', globals: newGlobals })
        },
      }),
      questionNums,
      currentQuestionNum,
      filteredSubmissions,
    }
  },
})
</script>
