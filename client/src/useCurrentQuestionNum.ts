import { Ref, ref, watch } from 'vue'

/**
 * Deal with changing question numbers. For example, if a new question is available,
 * we want to automatically switch to that question. If a question goes away, we need
 * to switch away from it.
 * @param questionNums A Ref to the array of available question numbers
 * @param isAdmin Are you an admin? If so, it'll default
 * to the first question instead of the last.
 * @returns a Ref to the current question number
 */
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
