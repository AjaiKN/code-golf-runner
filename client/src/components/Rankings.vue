<template>
  <div>
    <h2>Current Rankings</h2>
    <ol>
      <li
        v-for="ranking in filteredRankings"
        :key="ranking.name"
        :value="ranking.ranking"
      >
        {{ ranking.name }}, {{ ranking.score }} points
      </li>
    </ol>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { Ranking } from '../../../server-src/types'

export default defineComponent({
  components: {},
  props: { rankings: { type: Array as PropType<Ranking[]>, required: true } },
  emits: [],
  setup(props) {
    const filteredRankings = computed(() =>
      props.rankings.filter((r) => r.ranking <= 5),
    )
    return { filteredRankings }
  },
})
</script>
