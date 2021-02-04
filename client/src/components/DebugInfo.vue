<template>
  <!-- Displaying the debug info from tio.run output -->

  <pre><code :style="style">{{text.big}}<details class="small"><summary>Click for timing info</summary>{{text.small}}</details></code></pre>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: { str: { type: String, required: true } },
  computed: {
    // Split text into big part and small part
    // Big part is error messages, small part is performance notes
    text(): { big: string; small: string } {
      const regex = /^(.*)\n(Real time:.*)$/s
      const res = regex.exec(this.str)
      if (res == null) return { big: this.str, small: '' }
      else return { big: res[1].trim(), small: res[2] }
    },
    style(): any {
      return this.str.includes('Exit code: 0') ? {} : { color: 'red' }
    },
  },
})
</script>

<style scoped>
.small {
  font-size: 0.7em;
  line-height: normal;
}

pre,
code {
  margin: 0 1rem;
}
</style>
