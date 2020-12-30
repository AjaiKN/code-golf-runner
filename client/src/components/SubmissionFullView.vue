<template>
  <p v-if="!isAdmin">{{ getHumanTime(submission.timestamp) }}</p>
  <p>
    <a :href="submission.submission">{{ submission.submission }}</a>
  </p>
  <template v-if="submission.result">
    <p v-if="!isAdmin">{{ submission.result.lang }}</p>
    <pre
      v-if="!isAdmin"
      style="margin-bottom: 2rem"
    ><code>{{submission.result.code}}</code></pre>
    <table v-if="submission.result.inputsOutputs" class="inner-table">
      <thead>
        <th>In</th>
        <th>Out</th>
        <th>Debug</th>
      </thead>
      <tbody>
        <tr v-for="c in submission.result.inputsOutputs">
          <td>
            <pre><code>{{c.input}}</code></pre>
          </td>
          <td>
            <pre><code>{{c.output}}</code></pre>
          </td>
          <td>
            <debug-info :str="c.debug"></debug-info>
          </td>
        </tr>
      </tbody>
    </table>
    <template v-if="submission.result.header">
      Header:
      <pre><code>{{submission.result.header}}</code></pre>
    </template>
    <template v-if="submission.result.footer">
      Footer:
      <pre><code>{{submission.result.footer}}</code></pre>
    </template>
    <template v-if="submission.result.commandLineOptions.length > 0">
      Command Line Options:
      <ul>
        <li v-for="a in submission.result.commandLineOptions">
          <pre><code>{{a}}</code></pre>
        </li>
      </ul>
    </template>
    <template v-if="submission.result.commandLineArguments.length > 0">
      Command Line Arguments:
      <ul>
        <li v-for="a in submission.result.commandLineArguments">
          <pre><code>{{a}}</code></pre>
        </li>
      </ul>
    </template>
  </template>
  <template v-else-if="submission.result === null">
    <p>Failed to run submission</p>
  </template>
  <template v-else>
    <p>Evaluating submission...</p>
  </template>
</template>

<script lang="ts">
import { getHumanTime } from '../getHumanTime'
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    submission: { type: Object, required: true },
    isAdmin: { type: Boolean, default: false },
  },
  setup() {
    return { getHumanTime }
  },
})
</script>
