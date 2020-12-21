const DebugInfo = {
  name: 'debug-info',
  props: { str: String },
  computed: {
    // Split text into big part and small part
    // Big part is error messages, small part is performance notes
    text() {
      const regex = /^(.*)\n(Real time:.*)$/s
      const res = regex.exec(this.str)
      if (res == null) return { big: this.str, small: '' }
      else return { big: res[1], small: res[2] }
    },
    style() {
      return this.str.includes('Exit code: 0') ? {} : { color: 'red' }
    },
  },
  template:
    // prettier-ignore
    `<pre>` +
      `<code :style="style">` +
        `{{text.big}}` +
        `<div class="small">{{text.small}}</div>` +
      `</code>` +
    `</pre>`,
}

const getHumanTime = (timestamp) => new Date(timestamp).toLocaleTimeString()

export const FullView = {
  name: 'full-view',
  props: { submission: Object },
  components: { DebugInfo },
  setup() {
    return { getHumanTime }
  },
  template: /* HTML */ `
    <p>{{getHumanTime(submission.timestamp)}}, {{submission.name}}</p>
    <p>
      <a :href="submission.submission">{{submission.submission}}</a>
    </p>
    <template v-if="submission.result">
      <p>{{submission.result.lang}}</p>
      <br />
      <pre><code>{{submission.result.code}}</code></pre>
      <table class="inner-table">
        <thead>
          <th>In</th>
          <th>Out</th>
          <th>Debug</th>
        </thead>
        <tbody>
          <tr v-for="c in submission.result.inputsOutputs">
            <td>
              <pre><code>{{c.input}}</code></pre>
            </td>
            <td>
              <pre><code>{{c.output}}</code></pre>
            </td>
            <td>
              <debug-info :str="c.debug"></debug-info>
            </td>
          </tr>
        </tbody>
      </table>
      <template v-if="submission.result.header">
        Header:
        <pre><code>{{submission.result.header}}</code></pre>
      </template>
      <template v-if="submission.result.footer">
        Footer:
        <pre><code>{{submission.result.footer}}</code></pre>
      </template>
      <template v-if="submission.result.commandLineOptions.length > 0">
        Command Line Options:
        <ul>
          <li v-for="a in submission.result.commandLineOptions">
            <pre><code>{{a}}</code></pre>
          </li>
        </ul>
      </template>
      <template v-if="submission.result.commandLineArguments.length > 0">
        Command Line Arguments:
        <ul>
          <li v-for="a in submission.result.commandLineArguments">
            <pre><code>{{a}}</code></pre>
          </li>
        </ul>
      </template>
    </template>
    <template v-else-if="submission.result === null">
      <p>Failed to run submission</p>
    </template>
    <template v-else>
      <p>Evaluating submission...</p>
    </template>
  `,
}

const RowView = {
  name: 'row-view',
  props: { submission: Object },
  components: { DebugInfo },
  setup() {
    return { getHumanTime }
  },
  template: /* HTML */ `
    <tr>
      <td>{{getHumanTime(submission.timestamp)}}</td>
      <td>{{submission.name}}</td>
      <template v-if="submission.result">
        <td>{{submission.result.lang}}</td>
        <td>
          <pre><code>{{submission.result.code}}</code></pre>
        </td>
      </template>
      <template v-else-if="submission.result === null">
        <td colspan="2">Failed to run submission</td>
      </template>
      <template v-else>
        <td colspan="2">Evaluation submission...</td>
      </template>
    </tr>
  `,
}

const SubmissionView = {
  name: 'submission-view',
  props: { submission: Object },
  components: { FullView, RowView },
  data: () => ({ showFullView: false }),
  template: /* HTML */ `
    <row-view :submission="submission" @click="showFullView = !showFullView" />
    <tr v-if="showFullView">
      <td colspan="4" class="full-results-view-cell">
        <full-view :submission="submission" />
      </td>
    </tr>
  `,
}

export const SubmissionsTable = {
  name: 'admin-submissions-table',
  props: { submissions: Array },
  components: { SubmissionView },
  template: /* HTML */ `
    <table style="font-size: 15px">
      <thead>
        <th>Time</th>
        <th>Name</th>
        <th>Submission</th>
        <th>Code</th>
      </thead>
      <tbody>
        <tr v-if="submissions.length === 0">
          <td colspan="3">No submissions yet</td>
        </tr>
        <submission-view
          v-for="submission in submissions"
          :key="submission._id"
          :submission="submission"
        ></submission-view>
      </tbody>
    </table>
  `,
}

export const GolferSubmissionsTable = {
  name: 'golfer-submissions-table',
  props: { submittedForms: Array },
  components: { FullView },
  template: /* HTML */ `
    <table>
      <thead>
        <th>Name</th>
        <th>Submission</th>
        <th>Submission Status</th>
      </thead>
      <tbody>
        <tr v-if="submittedForms.length === 0">
          <td colspan="3">You haven't submitted anything yet</td>
        </tr>
        <template v-for="form in submittedForms" :key="form.id">
          <tr>
            <td>{{form.name}}</td>
            <td><a :href="form.text">{{form.text}}</a></td>
            <td>
              <span v-if="form.submittedSuccessfully == null">
                Submitting...
              </span>
              <span style="color: green" v-else-if="form.submittedSuccessfully">
                Submitted successfully at {{form.timestamp}}
              </span>
              <span style="color: red" v-else-if="!form.submittedSuccessfully">
                Submission failed. Please try again.
              </span>
            </td>
          </tr>
          <tr v-if="form.fullSubmissionInfo">
            <td colspan="3" class="full-results-view-cell">
              <full-view :submission="form.fullSubmissionInfo"></full-view>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  `,
}
