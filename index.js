// TODO: Require the rhythm
const interpreter = require('./Interpreter')
const interpreterInstance = interpreter.fromString(`
  start it, name it, code, rename it
  buy it, click, format it, rate it
  press it, name it, code, rename it
  name it, code it, quick - rename it
  quick - format it, print it, break it

  technologic
`)
interpreterInstance.runToEnd()
