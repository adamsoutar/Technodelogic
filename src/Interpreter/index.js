const Interpreter = require('./Interpreter')
const parser = require('../Parser')

module.exports = {
  Interpreter,
  fromString: (s) =>
    new Interpreter(
      new parser.Parser(
        new parser.TokenStream(
          new parser.CharStream(s)
        )
      ).generateAST()
    )
}
