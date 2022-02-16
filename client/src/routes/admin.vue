<template>
  <ShowConnectivity :is-connected="isConnected" />

  <div style="display: flex; gap: 2rem; flex-wrap: wrap">
    <AdminQuestionStatusControl v-if="globals" v-model:globals="globals" />
    <Rankings
      v-if="adminInfo?.rankings && adminInfo.rankings.length > 0"
      :rankings="adminInfo.rankings"
    />
  </div>

  <div
    style="display: flex; align-items: center"
    v-if="currentQuestionNum != null"
  >
    <span>Question:&nbsp;</span>
    <QuestionSelection
      v-if="currentQuestionNum != null"
      v-model:currentQuestionNum="currentQuestionNum"
      :questionNums="questionNums"
    />

    <button style="margin-left: 1rem" @click="changeQuestionNumber">
      Change this question's number
    </button>
    <button @click="removeQuestion">Remove this question</button>
    <button @click="addQuestion">Add a question</button>
  </div>

  <AdminQuestionsEdit
    v-if="globals && currentQuestionNum != null"
    v-model:globals="globals"
    :currentQuestionNum="currentQuestionNum"
  />

  <pre v-if="error">{{ error }}</pre>

  <p v-else-if="!adminInfo">Loading...</p>

  <div v-else>
    <h1 style="margin-bottom: 0.4rem">Code Golf Results</h1>
    <p>
      Click on a row to view more details.
      <button @click="deleteAllSubmissions">
        Delete all submissions for all questions
      </button>
    </p>

    <SubmissionAdmin :submissions="filteredSubmissions" />
  </div>

  <div style="height: 200vh" />
</template>

<script lang="ts">
import { debounce } from 'lodash-es'
import { computed, defineComponent, ref, watchEffect } from 'vue'
import type {
  AnnotatedSubmission,
  Globals,
  Ranking,
  ScoredSubmission,
} from '../../../server-src/types'
import AdminQuestionStatusControl from '../components/AdminQuestionStatusControl.vue'
import QuestionSelection from '../components/QuestionSelection.vue'
import ShowConnectivity from '../components/ShowConnectivity.vue'
import SubmissionAdmin from '../components/SubmissionAdmin.vue'
import Rankings from '../components/Rankings.vue'
import { useWebsocket } from '../http'
import { useCurrentQuestionNum } from '../useCurrentQuestionNum'
import AdminQuestionsEdit from '../components/AdminQuestionsEdit.vue'

import produce, { setAutoFreeze } from 'immer'
setAutoFreeze(false)

export default defineComponent({
  components: {
    SubmissionAdmin,
    ShowConnectivity,
    AdminQuestionStatusControl,
    QuestionSelection,
    Rankings,
    AdminQuestionsEdit,
  },
  setup() {
    const error = ref()

    const adminInfo = ref<{ submissions: ScoredSubmission[] }>()

    const globals = ref<Globals>()

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
          // copied from questions.ts
          .sort((s1, s2) => {
            if (s1.correctness.correct && !s2.correctness.correct) return -1
            if (!s1.correctness.correct && s2.correctness.correct) return +1
            if (!s1.isOutdated && s2.isOutdated) return -1
            if (s1.isOutdated && !s2.isOutdated) return +1
            let ret = 0
            if (s1.result?.codeBytes != null && s2.result?.codeBytes != null) {
              ret = s1.result.codeBytes - s2.result.codeBytes
            }
            if (ret !== 0) return ret
            ret =
              new Date(s2.timestamp).getTime() -
              new Date(s1.timestamp).getTime()
            return ret
          })
          .filter((s) => s.questionNum === currentQuestionNum.value),
    )

    const globalsProxy = computed({
      get: () => globals.value,
      set: (newGlobals) => {
        globals.value = globals.value
        send({ type: 'update:globals', globals: newGlobals })
      },
    })

    function changeQuestionNumber() {
      const newQuestionNum = prompt('Enter the new question number')
      if (newQuestionNum == null) return
      const newQuestionNumInt = parseInt(newQuestionNum)
      if (isNaN(newQuestionNumInt)) {
        alert('Invalid question number')
        return
      }
      if (questionNums.value?.includes(newQuestionNumInt)) {
        alert('Question number already exists')
        return
      }
      const newGlobals = produce(globals.value, (draft) => {
        if (draft == null) return
        const question = draft.questions.find(
          (q) => q.questionNum === currentQuestionNum.value,
        )
        if (question == null) return
        question.questionNum = newQuestionNumInt

        draft.questions = draft.questions.sort(
          (q1, q2) => q1.questionNum - q2.questionNum,
        )
      })
      globalsProxy.value = newGlobals
    }

    function removeQuestion() {
      if (!confirm('Are you sure you want to remove this question?')) return
      const newGlobals = produce(globals.value, (draft) => {
        if (draft == null) return
        const questionIndex = draft.questions.findIndex(
          (q) => q.questionNum === currentQuestionNum.value,
        )
        draft.questions.splice(questionIndex, 1)
      })
      globalsProxy.value = newGlobals
    }

    function addQuestion() {
      const newGlobals = produce(globals.value, (draft) => {
        if (draft == null) return
        draft.questions.push({
          questionNum: questionNums.value?.length
            ? Math.max(...questionNums.value) + 1
            : 1,
          inputsOutputs: [{ isGivenExample: true, input: '', output: '' }],
          status: 'notStarted',
          text: '',
        })

        draft.questions = draft.questions.sort(
          (q1, q2) => q1.questionNum - q2.questionNum,
        )
      })
      globalsProxy.value = newGlobals
    }

    function deleteAllSubmissions() {
      if (
        !window.confirm(
          'Woah! Are you sure you want to delete every submission for every question?',
        )
      )
        return

      send({ type: 'deleteAllSubmissions' })
    }

    return {
      adminInfo,
      submissions: computed(() => adminInfo.value?.submissions),
      error,
      isConnected,
      globals: globalsProxy,
      questionNums,
      currentQuestionNum,
      filteredSubmissions,
      changeQuestionNumber,
      removeQuestion,
      addQuestion,
      deleteAllSubmissions,
    }
  },
})
</script>
