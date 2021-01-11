<template>
  <div class="submission">
    <form @submit.prevent="submit">
      <label>
        Tio.Run Link:
        <input v-model="text" required />
      </label>
      <button type="submit">Submit</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, reactive, Ref, ref } from 'vue'
import { nanoid } from 'nanoid'
import { post } from '../http'

export default defineComponent({
  components: {},
  props: {
    currentQuestionNum: { type: Number, required: true },
  },
  setup(props) {
    const text = ref('')

    const auth = inject<Ref<any>>('auth')!

    function submit() {
      if (
        !/^(https?:\/\/)?(tryitonline\.net|tio\.run)\//.test(text.value) &&
        !window.confirm(
          "This doesn't look like a tio.run link. Are you sure you want to submit it?",
        )
      ) {
        return
      }
      post('/submission', {
        ...auth.value,
        questionNum: props.currentQuestionNum,
        submission: text.value,
      })
      text.value = ''
    }

    return { text, submit }
  },
})
</script>

<style scoped>
.submission {
}
.submission label,
.submission button {
  display: block;
  margin-top: 1rem;
}
.submission input {
  display: block;
  margin-top: 0.3rem;
  width: 100%;
  font-size: 18px;
}
</style>
