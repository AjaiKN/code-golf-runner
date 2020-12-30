<template>
  <ShowConnectivity :is-connected="isConnected" />

  <pre v-if="error">{{ error }}</pre>

  <p v-else-if="!adminInfo">Loading...</p>

  <div v-else>
    <h1>Code Golf Results</h1>

    <SubmissionAdmin :submissions="submissions" />
  </div>
</template>

<script>
import { computed, defineComponent, ref } from 'vue'
import ShowConnectivity from '../components/ShowConnectivity.vue'
import SubmissionAdmin from '../components/SubmissionAdmin.vue'
import { useWebsocket } from '../http'

export default defineComponent({
  components: {
    SubmissionAdmin,
    ShowConnectivity,
  },
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
