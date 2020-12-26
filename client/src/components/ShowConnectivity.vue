<template>
  <teleport to="#top-right">
    <span style="color: green" v-if="isConnected">Connected to server</span>
    <span style="color: red" v-else>
      Not connected to server :(
      <br />
      Attempting to connect{{ '.'.repeat(numDots) }}
    </span>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect } from 'vue'

export default defineComponent({
  setup(props) {
    let numDots = ref(0)
    function updateNumDots() {
      numDots.value = (numDots.value + 1) % 4
    }
    let intervalId: NodeJS.Timeout
    watchEffect(() => {
      if (!props.isConnected) {
        intervalId = setInterval(updateNumDots, 400)
      } else if (intervalId) {
        clearInterval(intervalId)
      }
    })
    return { numDots }
  },
  props: { isConnected: Boolean },
})
</script>
