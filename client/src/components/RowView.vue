<template>
  <tr>
    <td>{{ getHumanTime(submission.timestamp) }}</td>
    <td>{{ submission.name }}</td>
    <template v-if="submission.result">
      <td>{{ submission.result.lang }}</td>
      <td>
        <pre><code>{{submission.result.code}}</code></pre>
      </td>
    </template>
    <template v-else-if="submission.result === null">
      <td :colspan="2">Failed to run submission</td>
    </template>
    <template v-else>
      <td :colspan="2">Evaluation submission...</td>
    </template>
  </tr>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { getHumanTime } from '../getHumanTime'
import DebugInfo from './DebugInfo.vue'

export default defineComponent({
  props: { submission: { type: Object, required: true } },
  components: { DebugInfo },
  setup() {
    return { getHumanTime }
  },
})
</script>
