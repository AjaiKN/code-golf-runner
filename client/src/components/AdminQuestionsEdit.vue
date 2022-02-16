<script setup lang="ts">
import { cloneDeep, isEqual } from 'lodash-es'
import {
  computed,
  defineEmits,
  defineProps,
  ref,
  watch,
  watchEffect,
} from 'vue'
import type { Globals } from '../../../server-src/types'

function removeStatuses(g: Globals) {
  return {
    ...g,
    questions: g.questions.map((q: any) => ({ ...q, status: undefined })),
  }
}

function basicallyEquals(a: Globals, b: Globals) {
  return isEqual(removeStatuses(a), removeStatuses(b))
}

const props = defineProps<{ globals: Globals; currentQuestionNum: number }>()
const emit = defineEmits<{
  (type: 'update:globals', globals: Globals): void
}>()

const isSaving = ref(false)

const myGlobals = ref(cloneDeep(props.globals))

const state = computed<'saved' | 'editing' | 'saving'>(() => {
  return isSaving.value
    ? 'saving'
    : basicallyEquals(props.globals, myGlobals.value)
    ? 'saved'
    : 'editing'
})

function save() {
  isSaving.value = true
  emit('update:globals', myGlobals.value)
}

watch(
  () => props.globals,
  (newGlobals) => {
    myGlobals.value = cloneDeep(newGlobals)
    setTimeout(() => {
      isSaving.value = false
    }, 1000)
  },
  { deep: true },
)

watchEffect(() => {
  console.log(basicallyEquals(myGlobals.value, props.globals))
})

const numDeletes = ref(0)

function add() {
  myGlobals.value.questions[props.currentQuestionNum].inputsOutputs.push({
    isGivenExample: false,
    input: '',
    output: '',
  })
}

function remove(index: number) {
  const { inputsOutputs } = myGlobals.value.questions[props.currentQuestionNum]
  inputsOutputs.splice(index, 1)
  numDeletes.value++
}

const hidden = ref(false)
</script>

<template>
  <div v-if="hidden"><button @click="hidden = false">Edit</button></div>
  <div
    v-else
    style="border: 1px solid white; padding: 1.5rem; margin-top: 1rem"
  >
    <button
      @click="hidden = true"
      style="
        position: absolute;
        transform: translate(-1.4rem, -2rem);
        font-size: 20px;
        background-color: transparent;
        border: none;
        color: white;
      "
      title="Hide"
    >
      -
    </button>
    <button
      :disabled="state === 'saving' || state === 'saved'"
      @click="save"
      :style="[
        'width: 100%; padding-top: 0.6rem; padding-bottom: 0.6rem',
        state === 'editing' ? { color: 'red' } : {},
      ]"
    >
      {{
        state === 'saving'
          ? 'Saving...'
          : state === 'saved'
          ? 'Saved ✓'
          : 'Your changes are not saved. Click here to save.'
      }}
    </button>

    <details class="introduction">
      <summary>Announcements</summary>
      <textarea
        v-model="myGlobals.introduction"
        :disabled="isSaving"
        style="width: 90%; height: 10rem"
      />
    </details>

    <div style="display: flex; width: 100%">
      <div style="min-width: 40%; width: 100%">
        <details class="question" open>
          <summary>Question</summary>
          <textarea
            v-model="myGlobals.questions[currentQuestionNum].text"
            :disabled="isSaving"
            style="width: 90%; height: 10rem"
          />
        </details>
      </div>

      <details style="width: 100%">
        <summary>Inputs/Outputs</summary>
        <table style="width: 100%">
          <thead>
            <th>Delete</th>
            <th>
              Given
              <br />
              example?
            </th>
            <th>Input</th>
            <th>Output</th>
          </thead>
          <tbody>
            <tr
              v-for="(inputOutput, index) in myGlobals.questions[
                currentQuestionNum
              ].inputsOutputs"
              :key="'' + numDeletes + '-' + index"
            >
              <td>
                <button @click="remove(index)" :disabled="isSaving">X</button>
              </td>
              <td>
                <input
                  type="checkbox"
                  v-model="inputOutput.isGivenExample"
                  :disabled="isSaving"
                />
              </td>
              <td>
                <textarea v-model="inputOutput.input" :disabled="isSaving" />
              </td>
              <td>
                <textarea v-model="inputOutput.output" :disabled="isSaving" />
              </td>
            </tr>
            <tr>
              <td colspan="4">
                <button @click="add" :disabled="isSaving">+</button>
              </td>
            </tr>
          </tbody>
        </table>
      </details>
    </div>
  </div>
</template>

<style scoped>
table textarea {
  width: 100%;
  height: 100%;
}

thead th {
  padding: 0.2rem;
}
</style>
