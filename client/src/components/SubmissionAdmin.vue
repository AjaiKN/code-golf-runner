<template>
  <!-- The submissions table on the admin page -->

  <table style="font-size: 15px">
    <thead>
      <th style="width: 1rem">Score</th>
      <th style="width: 1rem">Status</th>
      <th style="width: 1rem">Chars</th>
      <th>Name</th>
      <th>Language</th>
      <th>Code</th>
    </thead>
    <tbody>
      <tr v-if="submissions.length === 0">
        <td :colspan="100">No submissions yet</td>
      </tr>
      <SubmissionAdminOpenableRow
        v-for="submission in submissions"
        :key="submission._id.toString()"
        :submission="submission"
      />
    </tbody>
  </table>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import SubmissionAdminOpenableRow from './SubmissionAdminOpenableRow.vue'

export default defineComponent({
  components: { SubmissionAdminOpenableRow },
  props: {
    submissions: { type: Array as PropType<any[]>, required: true },
  },
})
</script>
