<template>
  <!-- Grid of radio buttons at the top of the admin page for controlling 
  whether each question hasn't started, is in progress, or is finished. -->

  <form @submit.prevent="() => {}">
    <table class="table">
      <thead>
        <tr>
          <th />
          <th
            v-for="{ questionNum } in globals.questions"
            :key="questionNum"
            v-text="questionNum"
            scope="col"
          />
        </tr>
      </thead>
      <tbody>
        <tr v-for="statusType in statusTypes" :key="statusType">
          <th scope="row">{{ statusType }}</th>
          <td
            v-for="{ questionNum, status } in globals.questions"
            :key="questionNum"
          >
            <input
              type="radio"
              :name="'question-' + questionNum"
              :value="statusType"
              :checked="status === statusType"
              @click="setStatus(questionNum, statusType, $event)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </form>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'

import produce, { setAutoFreeze } from 'immer'
setAutoFreeze(false)

export default defineComponent({
  components: {},
  props: { globals: { type: Object, required: true } },
  emits: ['update:globals'],
  setup(props, { emit }) {
    const statusTypes = ['notStarted', 'started', 'finished']

    function setStatus(questionNum: number, status: string, event: any) {
      const newGlobals = produce(props.globals, (draft) => {
        const question = draft.questions.find(
          (q: any) => q.questionNum === questionNum,
        )!
        question.status = status
      })
      emit('update:globals', newGlobals)
      // Stop radio button from changing until it actually changes on the server
      event.preventDefault()
    }

    return {
      // questions: computed(() => globals.value.questions),
      statusTypes,
      setStatus,
    }
  },
})
</script>

<style scoped>
.table {
  width: auto;
  border: 2px solid #ccc;
}

.table th,
.table td {
  border: 0.1px solid gray;
  border-right: 2px solid #ccc;
}
</style>
