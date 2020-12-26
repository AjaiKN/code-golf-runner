<template>
  <show-connectivity :is-connected="isConnected"></show-connectivity>

  <pre v-if="error">{{ error }}</pre>

  <p v-else-if="!adminInfo">Loading...</p>

  <div v-else>
    <h1>Code Golf Results</h1>

    <submissions-table :submissions="submissions"></submissions-table>
  </div>
</template>

<script>
import { computed, defineComponent, ref } from 'vue'
import { useWebsocket } from '../http'
import SubmissionsTable from '../components/SubmissionsTable.vue'
import ShowConnectivity from '../components/ShowConnectivity.vue'

export default defineComponent({
  components: { SubmissionsTable, ShowConnectivity },
  setup() {
    const error = ref()

    const adminInfo = ref()

    const { isConnected, send } = useWebsocket('/admin', {
      onConnect: () => {
        send({ type: 'auth', password: window.location.hash.substring(1) })
      },
      onMessage: {
        update: (message) => (adminInfo.value = message),
      },
    })

    return {
      adminInfo,
      submissions: computed(() => adminInfo.value?.submissions),
      error,
      isConnected,
    }
  },
})
</script>
