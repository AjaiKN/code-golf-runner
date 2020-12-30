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

  <RenderMarkdown :markdown="markdownDescription" />

  <div class="submission">
    <form @submit.prevent="submit">
      <label>
        Tio.Run Link:
        <input v-model="text" required />
      </label>
      <button type="submit">Submit</button>
    </form>
  </div>

  <SubmissionGolf v-if="submittedForms" :submitted-forms="submittedForms" />
</template>

<script lang="ts">
import { nanoid } from 'nanoid'
import { defineComponent, reactive, ref } from 'vue'
import { post } from '../http'
import RenderMarkdown from './RenderMarkdown.vue'
import SubmissionGolf from './SubmissionGolf.vue'

export default defineComponent({
  components: { RenderMarkdown, SubmissionGolf },
  props: {
    auth: { type: Object, required: true },
    markdownDescription: { type: String, required: false },
    submittedForms: { type: Array, required: true },
  },
  emits: ['log-out'],
  setup(props) {
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
        ...props.auth,
        submission: formToSubmit.text,
      })
    }

    return { text, submit }
  },
})
</script>
