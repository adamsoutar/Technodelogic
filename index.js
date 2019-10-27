// TODO: Require the rhythm
const interpreter = require('./Interpreter')
const interpreterInstance = interpreter.fromString(`
  view save,
  watch touch fax it,
  send it

  pause it
    Should print 5, if expression
    keywords are implemented
  play it

  technologic
`)
interpreterInstance.runToEnd()
