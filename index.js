// TODO: Require the rhythm
const interpreter = require('./Interpreter')
const interpreterInstance = interpreter.fromString(`
  zip view touch watch unzip turn send scroll

  technologic
`)
interpreterInstance.runToEnd()
