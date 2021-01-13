<template>
  <!-- Allow admin to click on a row to view more information about a submission -->

  <SubmissionAdminRow
    :submission="submission"
    @click="showFullView = !showFullView"
  />
  <tr v-if="showFullView">
    <td :colspan="100" class="full-results-view-cell">
      <SubmissionFullView :isAdmin="true" :submission="submission" />
    </td>
  </tr>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SubmissionAdminRow from './SubmissionAdminRow.vue'
import SubmissionFullView from './SubmissionFullView.vue'

export default defineComponent({
  components: { SubmissionAdminRow, SubmissionFullView },
  props: { submission: { type: Object, required: true } },
  data: () => ({ showFullView: false }),
})
</script>

<style scoped>
.full-results-view-cell {
  padding: 1rem 10rem;
  border: none;
}
</style>
