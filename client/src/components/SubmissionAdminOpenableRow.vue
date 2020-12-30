<template>
  <SubmissionAdminRow
    :submission="submission"
    @click="showFullView = !showFullView"
  />
  <tr v-if="showFullView">
    <td :colspan="4" class="full-results-view-cell">
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
