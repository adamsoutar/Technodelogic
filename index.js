// TODO: Require the rhythm
const interpreter = require('./Interpreter')
const interpreterInstance = interpreter.fromString(`
  use it, (a, bring it, b, bring it) add, code it
    a touch it b, unlock it
  break it

  use it, (3, plug it, 2 plug it) add call it

  technologic
`)
interpreterInstance.runToEnd()
