// TODO: Require the rhythm
const interpreter = require('./Interpreter')
const interpreterInstance = interpreter.fromString(`
  use it, (a, bring it, b, bring it) add, code it
    click find
    name it a rename it touch it name it b rename it, unlock it
  break it

  use it, (a, bring it, b, bring it) subtract, code it
    name it a rename it trash it name it b rename it, unlock it
  break it

  use it, (view, plug it, watch plug it) add call it
  send it

  technologic
`)
interpreterInstance.runToEnd()
