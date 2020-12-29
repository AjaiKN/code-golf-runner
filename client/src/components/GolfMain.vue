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

  <render-markdown :markdown="markdownDescription" />

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
</template>

<script lang="ts">
import { nanoid } from 'nanoid'
import { defineComponent, reactive, ref } from 'vue'
import { post } from '../http'
import GolferSubmissionsTable from './GolferSubmissionsTable.vue'
import RenderMarkdown from './RenderMarkdown.vue'

export default defineComponent({
  components: { GolferSubmissionsTable, RenderMarkdown },
  props: {
    auth: { type: Object, required: true },
    markdownDescription: { type: String, required: true },
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
