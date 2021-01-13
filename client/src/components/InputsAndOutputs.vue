<template>
  <!-- Displaying a table of inputs and outputs -->

  <table class="inner-table">
    <thead>
      <th>In</th>
      <th>Out</th>
      <th v-if="!isExamples">Expected Out</th>
      <th v-if="!isExamples">Debug</th>
    </thead>
    <tbody>
      <!-- eslint-disable-next-line vue/require-v-for-key -->
      <tr v-for="c in inputsOutputs">
        <td>
          <pre><code>{{ c.input }}</code></pre>
        </td>

        <td>
          <pre><code :style="{ color: isExamples || c.isCorrect ? 'green' : 'red' }">{{ c.output }}</code></pre>
        </td>
        <td v-if="!isExamples">
          <pre><code style="color: green">{{ c.expectedOutput }}</code></pre>
        </td>

        <td v-if="!isExamples">
          <DebugInfo :str="c.debug" />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { computed, defineComponent, h, PropType } from 'vue'
import type { AnnotatedResultInputOutput } from '../../../server-src/types'
import DebugInfo from './DebugInfo.vue'

export default defineComponent({
  components: { DebugInfo },
  props: {
    inputsOutputs: {
      type: Array as PropType<AnnotatedResultInputOutput[]>,
      required: true,
    },
    isExamples: Boolean,
  },
  setup(props) {
    return {}
  },
})
</script>

<style scoped>
table {
  margin: 0;
}

td {
  padding: 3px;
}
</style>
