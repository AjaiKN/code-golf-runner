<template>
  <div class="the-container">
    <button
      class="button"
      v-for="n in questionNums"
      :key="n"
      :disabled="n === currentQuestionNum"
      @click="$emit('update:currentQuestionNum', n)"
    >
      {{ n }}
    </button>
    <button
      v-if="allowCreatingQuestions"
      class="button plus"
      @click="$emit('createQuestion')"
    >
      +
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  props: {
    questionNums: { type: Array as PropType<number[]>, required: true },
    currentQuestionNum: { type: Number, required: true },
    allowCreatingQuestions: Boolean,
  },
  emits: ['update:currentQuestionNum', 'createQuestion'],
})
</script>

<style scoped>
.button {
  display: inline-block;
  border: 0.5px solid white;
  padding: 0.8rem 1.6rem;
  margin: 0;
  text-decoration: none;
  background: rgb(13, 34, 102);
  color: #ffffff;
  font-family: sans-serif;
  font-size: 1.1rem;
  cursor: pointer;
  text-align: center;
  transition: background 250ms ease-in-out, transform 150ms ease;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.button:hover,
.button:focus {
  background: #0053ba;
}

.button:disabled {
  background: white;
  cursor: default;
  color: #0e468a;
  font-weight: bold;
  transform: scale(1.01);
}

.button:focus {
  outline: 1px solid #fff;
  outline-offset: -4px;
}

.button:active {
  transform: scale(0.99);
}

.plus {
  background: green;
}
.plus:hover,
.plus:focus {
  background: darkgreen;
}
</style>
