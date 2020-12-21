export const exampleSubmission = {
  testCases: [
    { input: '3\n', output: '4\n' },
    { input: '4\n', output: '5\n', hidden: false },
    { input: '5\n', output: '6\n', hidden: true },
  ],
  submissions: [
    {
      _id: 'a',
      name: 'my name',
      submission: 'https://tio.run/fdaskfjad',
      result: {
        lang: 'Ruby',
        code:
          'puts(gets.to_i + 1)afsdjkjafkjakdsfjaksdjfkjadskfjasdkjfkdsjakd\nputs "Hi"\n',
        inputsOutputs: [
          {
            input: '3\n',
            output: '4\n',
            debug: 'Ra\nndojkdasjfkdasjfkdsajkfjdsakfjkasdjfksajdm\nst\nuff',
          },
          { input: '4\n', output: '5', debug: 'Oth\ner\nstuf\nf' },
          { input: '5\n', output: '7\n', debug: 'D\nebu\ng in\nfo' },
        ],
        header: null,
        footer: 'foot',
        commandLineOptions: [],
        commandLineArguments: ['a', 'b'],
      },
      timestamp: new Date(),
    },
    {
      _id: 'a',
      name: 'Joe',
      submission: 'https://tio.run/fdaskfjad',
      timestamp: new Date(),
    },
    {
      _id: 'a',
      name: 'my name',
      submission: 'https://tio.run/fdaskfjad',
      timestamp: new Date(),
      result: {
        lang: 'Ruby',
        code: 'puts(gets.to_i + 1',
        inputsOutputs: [
          {
            input: '5\n',
            output: '',
            debug:
              ".code.tio:1: syntax error, unexpected end-of-input, expecting ')'\n" +
              'puts(gets.to_i + 1\n' +
              '                  ^\n' +
              '\n' +
              'Real time: 0.108 s\n' +
              'User time: 0.061 s\n' +
              'Sys. time: 0.024 s\n' +
              'CPU share: 79.03 %\n' +
              'Exit code: 1',
          },
          {
            input: '6\n',
            output: '',
            debug:
              ".code.tio:1: syntax error, unexpected end-of-input, expecting ')'\n" +
              'puts(gets.to_i + 1\n' +
              '                  ^\n' +
              '\n' +
              'Real time: 0.091 s\n' +
              'User time: 0.066 s\n' +
              'Sys. time: 0.024 s\n' +
              'CPU share: 98.62 %\n' +
              'Exit code: 1',
          },
          {
            input: '7\n',
            output: '',
            debug:
              '\n' +
              'Real time: 0.069 s\n' +
              'User time: 0.055 s\n' +
              'Sys. time: 0.013 s\n' +
              'CPU share: 99.11 %\n' +
              'Exit code: 1',
          },
        ],
        header: null,
        footer: null,
        commandLineOptions: [],
        commandLineArguments: [],
      },
    },
  ],
}
