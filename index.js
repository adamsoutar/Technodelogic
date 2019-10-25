// TODO: Require the rhythm
const interpreter = require('./Interpreter')
const interpreterInstance = interpreter.fromString(`
  quick - upgrade it, watch it, mail it
  mail, format it, print it, mail it
  click, erase it, click, format it
  print it, click, erase it, zoom it
  quick - format it, print it, print it
  click it, click it, click, format it
  print it, work it, work, format it
  print it, view it, watch, format it
  print it, zoom it, quick - upgrade it
  quick - format it, print it, click it
  click it, click, format it, print it
  click it, click it, work, format it
  print it, click, erase it, zoom it
  mail, format it, print it, click it
  quick - erase it, quick - erase it
  mail, format it, print it, view it
  view it, quick - format it, print it

  technologic
`)
interpreterInstance.runToEnd()
