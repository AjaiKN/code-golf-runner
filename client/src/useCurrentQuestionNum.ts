import { Ref, ref, watch } from 'vue'

export function useCurrentQuestionNum(
  questionNums: Ref<number[] | undefined>,
  { isAdmin = false } = {},
) {
  const currentQuestionNum = ref<number>()

  watch(
    questionNums,
    (newQuestionNums, oldQuestionNums) => {
      if (newQuestionNums == null || newQuestionNums.length === 0) {
        currentQuestionNum.value = undefined
      } else if (
        currentQuestionNum.value == null ||
        !newQuestionNums.includes(currentQuestionNum.value) ||
        oldQuestionNums == null ||
        // If a new question is added, jump to the newest question if you're a golfer
        (!isAdmin && newQuestionNums.length > oldQuestionNums.length)
      ) {
        currentQuestionNum.value = isAdmin
          ? Math.min(...newQuestionNums)
          : Math.max(...newQuestionNums)
      }
    },
    { immediate: true, flush: 'sync' },
  )

  return { currentQuestionNum }
}
