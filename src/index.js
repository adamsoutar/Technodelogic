// TODO: Require the rhythm
const interpreter = require('./Interpreter')
const interpreterInstance = interpreter.fromString(`
  use it buy bring it click bring it add code it
    name buy rename touch name click rename it unlock it
  break it

  view write watch

  use it name it watch rename it plug it view it plug it add call it
  send it scroll it
`)
interpreterInstance.runToEnd()
