<template>
  <!-- The "Your Previous Submissions" section on the golfer page -->

  <div style="margin-top: 2rem">
    <h2>Your Previous Submissions</h2>
    <p v-if="submittedForms.length === 0">Nothing submitted yet</p>
    <div style="padding: 0 1rem">
      <div
        style="border: 0.5px solid white; margin-top: 1rem; padding: 2rem"
        v-for="form in submittedForms"
        :key="form._id"
      >
        <SubmissionFullView :submission="form" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { getHumanTime } from '../getHumanTime'
import { defineComponent, PropType } from 'vue'
import SubmissionFullView from './SubmissionFullView.vue'

export default defineComponent({
  components: { SubmissionFullView },
  props: { submittedForms: { type: Array as PropType<any[]>, required: true } },
  setup() {
    return { getHumanTime }
  },
})
</script>
