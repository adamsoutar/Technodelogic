// TODO: Require the rhythm
const interpreter = require('./Interpreter')
const interpreterInstance = interpreter.fromString(`
  use it buy it bring it pay it bring it add code it
    name it buy it rename it touch name it pay it rename it unlock it
  break it

  use it click plug it watch plug it add call it
  send scroll
`)
interpreterInstance.runToEnd()
