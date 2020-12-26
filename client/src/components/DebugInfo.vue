<template>
  <pre><code :style="style">{{text.big}}<div class="small">{{text.small}}</div></code></pre>
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
      else return { big: res[1], small: res[2] }
    },
    style(): any {
      return this.str.includes('Exit code: 0') ? {} : { color: 'red' }
    },
  },
})
</script>
