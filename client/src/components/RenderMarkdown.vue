<template>
  <div v-if="html" v-html="html"></div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { getMarkdownHtml } from '../getMarkdownHtml'

export default defineComponent({
  props: {
    markdown: { type: String, required: false },
  },
  setup(props) {
    const html = computed(
      () => props.markdown && getMarkdownHtml(props.markdown),
    )
    return { html }
  },
})
</script>
