<template>
  <!-- Display correctness of a question, along with a little icon -->

  <div style="display: flex; align-items: center">
    <div>
      <component :is="'Zondicon' + iconName" />
    </div>
    <span v-if="showReason" style="font-size: 0.9em">
      &nbsp;{{
        correctness
          ? correctness.reason
          : '(result hidden — question still in progress)'
      }}
    </span>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import type { Correctness } from '../../../server-src/types'
import ZondiconCheckmark from './ZondiconCheckmark.vue'
import ZondiconX from './ZondiconX.vue'
import ZondiconRefresh from './ZondiconRefresh.vue'
import ZondiconTimer from './ZondiconTimer.vue'
import ZondiconTimerGray from './ZondiconTimerGray.vue'
import ZondiconQuestion from './ZondiconQuestion.vue'
import ZondiconBug from './ZondiconBug.vue'
import ZondiconLines from './ZondiconLines.vue'
import ZondiconExclamationOutline from './ZondiconExclamationOutline.vue'
import ZondiconViewHide from './ZondiconViewHide.vue'

export default defineComponent({
  components: {
    ZondiconCheckmark,
    ZondiconX,
    ZondiconRefresh,
    ZondiconTimer,
    ZondiconTimerGray,
    ZondiconQuestion,
    ZondiconBug,
    ZondiconLines,
    ZondiconExclamationOutline,
    ZondiconViewHide,
  },
  props: {
    correctness: { type: Object as PropType<Correctness>, required: false },
    showReason: Boolean,
  },
  setup(props) {
    return {
      iconName: computed(() => {
        if (!props.correctness) return 'ViewHide'
        if (props.correctness.correct) return 'Checkmark'
        else if (props.correctness.reason === 'still evaluating...')
          return 'Refresh'
        else if (
          props.correctness.reason ===
          "outdated (there's a newer, on-time submission)"
        )
          return 'TimerGray'
        else if (props.correctness.reason === 'submitted late') return 'Timer'
        else if (props.correctness.reason === 'not all test cases were tested')
          return 'Question'
        else if (
          props.correctness.reason ===
          'gave incorrect outputs for at least 1 test case'
        )
          return 'Bug'
        else if (
          props.correctness.reason &&
          props.correctness.reason!.includes('non-blank')
        )
          return 'Lines'
        else if (
          props.correctness.reason ===
          'unable to evaluate (probably a bad link)'
        )
          return 'ExclamationOutline'
        else return 'X'
      }),
    }
  },
})
</script>
