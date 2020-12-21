import {
  createApp,
  ref,
  reactive,
  computed,
  watchEffect,
} from 'https://unpkg.com/vue@3.0.4/dist/vue.esm-browser.js'
import { nanoid } from 'https://cdn.skypack.dev/pin/nanoid@v3.1.20-dsnQAVooO9DnkpQkIpbq/min/nanoid.js'
import { get, post } from './get-post.js'
import { throttle } from './throttle.js'
import { GolferSubmissionsTable } from './view-submission.js'

function getMarkdownHtml(markdownStr) {
  const html = marked(markdownStr)
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
}

// function actuallySubmitForm(form) {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       if (Math.random() < 0.5) resolve({ timestamp: new Date() })
//       else reject()
//     }, 1000)
//   })
// }

createApp({
  components: { GolferSubmissionsTable },
  setup() {
    const name = ref('')
    const text = ref('')
    const submittedForms = ref([])
    const ids = computed(() =>
      submittedForms.value.map(({ _id }) => _id).filter((_id) => _id),
    )

    function submit() {
      if (
        !/^(https?:\/\/)?(tryitonline\.net|tio\.run)\//.test(text.value) &&
        !window.confirm(
          "This doesn't look like a tio.run link. Are you sure you want to submit it?",
        )
      ) {
        return
      }
      const formToSubmit = reactive({
        id: nanoid(),
        name: name.value.trim(),
        text: text.value,
      })
      text.value = ''
      submittedForms.value.unshift(formToSubmit)
      post('/submission', {
        name: formToSubmit.name,
        submission: formToSubmit.text,
      })
        .then(({ timestamp, _id }) => {
          formToSubmit.timestamp = timestamp.toString()
          formToSubmit._id = _id
          formToSubmit.submittedSuccessfully = true
        })
        .catch((err) => {
          console.error(err)
          formToSubmit.submittedSuccessfully = false
        })
    }

    const markdownDescription = ref(null)
    const refreshDescription = throttle(async () => {
      const res = await get('/golferinfo?ids=' + ids.value.join('+'))
      markdownDescription.value = res.introduction
      for (const submission of res.submissions) {
        const s = submittedForms.value.find((f) => f._id === submission._id)
        s.fullSubmissionInfo = submission
      }
    }, 500)
    refreshDescription()
    setInterval(refreshDescription, 5000)

    watchEffect(() => console.log(submittedForms.value))

    return {
      theHtmlDescription: computed(
        () =>
          markdownDescription.value &&
          getMarkdownHtml(markdownDescription.value),
      ),
      submit,
      name,
      text,
      submittedForms,
      refreshDescription,
    }
  },
}).mount('#app')
