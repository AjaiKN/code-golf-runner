<template>
  <row-view :submission="submission" @click="showFullView = !showFullView" />
  <tr v-if="showFullView">
    <td :colspan="4" class="full-results-view-cell">
      <full-view :is-admin="true" :submission="submission" />
    </td>
  </tr>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import FullView from './FullView.vue'
import RowView from './RowView.vue'

export default defineComponent({
  components: { FullView, RowView },
  props: { submission: { type: Object, required: true } },
  data: () => ({ showFullView: false }),
})
</script>
