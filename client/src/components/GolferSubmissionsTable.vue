<template>
  <div style="margin-top: 2rem">
    <h2>Previous Submissions</h2>
    <p v-if="submittedForms.length === 0">Nothing submitted yet</p>
    <div style="padding: 0 1rem">
      <div
        style="border: 0.5px solid white; margin-top: 1rem; padding: 2rem"
        v-for="form in submittedForms"
        :key="form._id"
      >
        <full-view :submission="form" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import FullView from './FullView.vue'
import { getHumanTime } from '../getHumanTime'
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  props: { submittedForms: { type: Array as PropType<any[]>, required: true } },
  components: { FullView },
  setup() {
    return { getHumanTime }
  },
})
</script>
