<template>
  <teleport to="#top-right">
    <div style="text-align: right">
      <button @click="$emit('log-out')">Log out</button>
    </div>
  </teleport>

  <h1>Welcome to TechOlympics Code Golf, {{ auth.name }}!</h1>

  <!-- prettier-ignore -->
  <p>
    Your secret phrase is <b>{{auth.secretPhrase}}</b>. Write it down!
  </p>

  <RenderMarkdown :markdown="globals.introduction" />

  <div class="question-container">
    <GolfQuestionBox :questions="globals.questions" />
  </div>

  <SubmissionGolf v-if="submittedForms" :submittedForms="submittedForms" />
</template>

<script lang="ts">
import { defineComponent, inject, PropType, ref } from 'vue'
import type { Globals, Question, Submission } from '../../../server/types'
import GolfQuestionBox from './GolfQuestionBox.vue'
import RenderMarkdown from './RenderMarkdown.vue'
import SubmissionGolf from './SubmissionGolf.vue'

export default defineComponent({
  components: { RenderMarkdown, SubmissionGolf, GolfQuestionBox },
  props: {
    globals: { type: Object as PropType<Globals>, required: false },
    submittedForms: { type: Array as PropType<Submission[]>, required: true },
  },
  emits: ['log-out'],
  setup(props) {
    const auth = inject('auth') as any

    // const questions = [
    //   {
    //     questionNum: 3,
    //     text:
    //       'This is the **description** of question 3. Given a number in standard input, print out that number plus one. ~~This is crossed out.~~',
    //     inputsOutputs: [
    //       { input: '5', output: '6', isGivenExample: true },
    //       { input: '6', output: '7', isGivenExample: true },
    //       { input: '7', output: '8', isGivenExample: false },
    //     ],
    //   },
    //   {
    //     questionNum: 4,
    //     text: 'This is the **description**.',
    //     inputsOutputs: [
    //       { input: '5', output: '6', isGivenExample: true },
    //       { input: '6', output: '7', isGivenExample: true },
    //       { input: '7', output: '8', isGivenExample: false },
    //     ],
    //   },
    // ]

    return { auth }
  },
})
</script>

<style scoped>
.question-container {
  border: 1px solid white;
  padding: 4rem 3rem;
  position: relative;

  margin: 0 auto;
  max-width: 80rem;
}

.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.bold {
  font-weight: bold;
}
</style>
