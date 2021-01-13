<template>
  <p v-if="!isAdmin">Question {{ submission.questionNum }}</p>
  <p>
    <Correctness :correctness="submission.correctness" :showReason="true" />
  </p>
  <p>
    {{ getHumanTime(submission.timestamp) }}
    <span v-if="submission.isLate" style="color: red">(Late)</span>
  </p>
  <p>
    <a :href="submission.submission">{{ submission.submission }}</a>
  </p>
  <template v-if="submission.result">
    <p v-if="!isAdmin">{{ submission.result.lang }}</p>
    <pre
      v-if="!isAdmin"
      style="margin-bottom: 2rem"
    ><code>{{submission.result.code}}</code></pre>
    <InputsAndOutputs
      v-if="submission.result.inputsOutputs"
      :inputsOutputs="submission.result.inputsOutputs"
    />
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
        <!-- eslint-disable-next-line vue/require-v-for-key -->
        <li v-for="a in submission.result.commandLineOptions">
          <pre><code>{{a}}</code></pre>
        </li>
      </ul>
    </template>
    <template v-if="submission.result.commandLineArguments.length > 0">
      Command Line Arguments:
      <ul>
        <!-- eslint-disable-next-line vue/require-v-for-key -->
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
import { defineComponent, PropType } from 'vue'
import InputsAndOutputs from './InputsAndOutputs.vue'
import type { Submission } from '../../../server-src/types'
import Correctness from './Correctness.vue'

export default defineComponent({
  components: { InputsAndOutputs, Correctness },
  props: {
    submission: {
      type: Object as PropType<Submission>,
      required: true,
    },
    isAdmin: { type: Boolean, default: false },
  },
  setup() {
    return { getHumanTime }
  },
})
</script>
