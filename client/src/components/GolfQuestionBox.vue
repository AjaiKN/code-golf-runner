<template>
  <p class="center bold" v-if="!currentQuestion">
    Waiting for the competition to begin...
  </p>

  <template v-else>
    <QuestionSelection
      style="margin-top: -2rem"
      v-model:currentQuestionNum="currentQuestionNum"
      :questionNums="questionNums"
    />

    <h2 style="margin-top: 0.5rem">
      Question {{ currentQuestion.questionNum }}
      <span v-if="currentQuestion.status === 'finished'" style="color: red">
        (time is up!)
      </span>
    </h2>
    <RenderMarkdown :markdown="currentQuestion.text" />

    <h3 style="margin-bottom: 0">Example Inputs and Outputs</h3>
    <InputsAndOutputs
      :inputsOutputs="filteredInputsOutputs"
      :isExamples="true"
      style="margin-top: 0"
    />

    <SubmitAnswer
      style="margin-top: 2rem"
      :currentQuestionNum="currentQuestion.questionNum"
    />
  </template>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from 'vue'
import InputsAndOutputs from './InputsAndOutputs.vue'
import RenderMarkdown from './RenderMarkdown.vue'
import SubmitAnswer from './SubmitAnswer.vue'
import QuestionSelection from './QuestionSelection.vue'
import { useCurrentQuestionNum } from '../useCurrentQuestionNum'
import type { Question } from '../../../server/types'

export default defineComponent({
  components: {
    RenderMarkdown,
    InputsAndOutputs,
    SubmitAnswer,
    QuestionSelection,
  },
  props: {
    questions: {
      type: Array as PropType<Question[]>,
      required: false,
    },
  },
  setup(props) {
    const questionNums = computed(
      () => props.questions && props.questions.map((q) => q.questionNum),
    )
    const { currentQuestionNum } = useCurrentQuestionNum(questionNums)
    const currentQuestion = computed(
      () =>
        props.questions &&
        props.questions.find((q) => q.questionNum === currentQuestionNum.value),
    )

    const filteredInputsOutputs = computed(
      () =>
        currentQuestion.value?.inputsOutputs &&
        currentQuestion.value.inputsOutputs.filter((i) => i.isGivenExample),
    )

    return {
      questionNums,
      currentQuestionNum,
      currentQuestion,
      filteredInputsOutputs,
    }
  },
})
</script>

<style scoped>
button {
  font-size: 1.1em;
  background-color: lightgray;
  color: black;
  font-weight: bolder;
  cursor: pointer;
}
</style>
