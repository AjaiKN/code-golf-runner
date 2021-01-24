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

  <RenderMarkdown :markdown="description + '\n\n' + globals.introduction" />

  <div class="question-container">
    <GolfQuestionBox :questions="globals.questions" />
  </div>

  <SubmissionGolf v-if="submittedForms" :submittedForms="submittedForms" />
</template>

<script lang="ts">
import { defineComponent, inject, PropType, ref } from 'vue'
import type { Globals, Question, Submission } from '../../../server-src/types'
import GolfQuestionBox from './GolfQuestionBox.vue'
import RenderMarkdown from './RenderMarkdown.vue'
import SubmissionGolf from './SubmissionGolf.vue'
import description from '../description'

export default defineComponent({
  components: { RenderMarkdown, SubmissionGolf, GolfQuestionBox },
  props: {
    globals: { type: Object as PropType<Globals>, required: false },
    submittedForms: { type: Array as PropType<Submission[]>, required: true },
  },
  emits: ['log-out'],
  setup(props) {
    const auth = inject('auth') as any

    return { auth, description }
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
