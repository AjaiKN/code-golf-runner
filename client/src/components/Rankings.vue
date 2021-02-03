<template>
  <div>
    <h2>Current Rankings</h2>
    <ol>
      <li
        v-for="ranking in rankings"
        :key="ranking.name"
        :value="ranking.ranking"
      >
        {{ ranking.name }}, {{ ranking.score }} points
      </li>
    </ol>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Ranking } from '../../../server-src/types'

export default defineComponent({
  components: {},
  props: { rankings: Array as PropType<Ranking[]> },
  emits: [],
  setup(props) {
    return {}
  },
})
</script>
