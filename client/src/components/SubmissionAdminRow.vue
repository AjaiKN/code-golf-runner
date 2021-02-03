<template>
  <!-- Displaying a submission as a table row on the admin page -->

  <tr>
    <td>{{ submission.score ?? '' }}</td>
    <td>
      <div style="display: flex; justify-content: center">
        <Correctness :correctness="submission.correctness" />
      </div>
    </td>
    <!-- // TODO: DON'T USE CODE LENGTH, USE BYTES -->
    <td>{{ submission.result?.code?.length ?? '' }}</td>
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
      <td :colspan="2">Evaluating submission...</td>
    </template>
  </tr>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { getHumanTime } from '../getHumanTime'
import Correctness from './Correctness.vue'

export default defineComponent({
  components: { Correctness },
  props: { submission: { type: Object, required: true } },
  setup() {
    return { getHumanTime }
  },
})
</script>
