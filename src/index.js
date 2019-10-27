// TODO: Require the rhythm
const fs = require('fs')
const interpreter = require('./Interpreter')

// TODO: Better loading
const interpreterInstance = interpreter.fromString(
  fs.readFileSync(process.argv[2], 'utf8')
)
interpreterInstance.runToEnd()
