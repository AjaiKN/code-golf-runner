<template>
  <div class="login">
    Please use your actual name. (If you don't want to, contact the competition
    administrators first so they know who you are.) You won't be able to change
    it later.
    <form @submit.prevent="submit">
      <div>
        <label for="name">Name:</label>
        <input
          required
          id="name"
          name="name"
          :readonly="isSubmittingForm || showSecretPhraseInput"
          v-model="myName"
        />
        <button
          v-if="showSecretPhraseInput"
          class="edit-button"
          :disabled="isSubmittingForm"
          type="button"
          @click="$emit('update:showSecretPhraseInput', false)"
        >
          Log into different name
        </button>
      </div>
      <div>
        <label v-if="showSecretPhraseInput">
          Secret Phrase:
          <input
            required
            :readonly="isSubmittingForm"
            v-model="mySecretPhrase"
          />
        </label>
      </div>
      <button class="submit-button">Log in</button>
    </form>
    <p v-if="isSubmittingForm">Submitting form...</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  props: {
    name: String,
    secretPhrase: String,
    showSecretPhraseInput: Boolean,
    isSubmittingForm: Boolean,
  },
  emits: ['submit', 'update:showSecretPhraseInput'],
  setup(props, { emit }) {
    const myName = ref(props.name)
    const mySecretPhrase = ref(props.secretPhrase)

    function submit() {
      emit('submit', { name: myName.value, secretPhrase: mySecretPhrase.value })
    }

    return { myName, mySecretPhrase, submit }
  },
})
</script>
