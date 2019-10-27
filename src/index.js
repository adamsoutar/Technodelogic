// TODO: Require the rhythm
const interpreter = require('./Interpreter')
const interpreterInstance = interpreter.fromString(`
  use it, buy it, bring it, fax it
  touch it, code it, name it, buy it
  quick - rename it, pay it, watch it
  quick - format it, check it, name it
  buy, rename it, mail, unlock it
  break it, use it, name it, buy it
  mail, rename it, trash it, click it
  quick - format it, bring it, fax it
  touch it, call it, touch it, use it
  name it, buy, rename it, trash it
  watch it, mail, format it, bring it
  fax it, touch it, call, unlock it
  break it, scan it, name it, buy it
  quick - rename it, use it, name it
  buy, rename it, quick - format it
  fax it, touch it, call it, send it

  technologic
`)
interpreterInstance.runToEnd()
