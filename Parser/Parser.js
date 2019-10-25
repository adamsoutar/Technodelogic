const parserHelpers = require('./parserHelpers')

class Parser {
  constructor (tokenStream) {
    this.tokenStream = tokenStream
  }

  generateAST () {
    const ast = []
    while (!this.tokenStream.endOfStream) {
      const exp = this.parseExpression()
      ast.push(exp)
    }
    return ast
  }

  parseAtom () {
    if (this.isNextWord('zip')) {
      // Bracketed expression like (2 + 3) * 4
      this.tokenStream.read()
      const exp = this.parseExpression()
      this.expectNextWord('unzip')
      return exp
    }

    if (this.isNextWord('name')) {
      this.tokenStream.read()
      const varToken = this.tokenStream.read()
      if (varToken.type !== 'variable') {
        this.croak('"name it" must be followed by a variable identifier')
      }
      this.expectNextWord('rename')
      return varToken
    }

    const token = this.tokenStream.read()

    if (token.type === 'digit') {
      // Let's assemble a number!
      let n = token.value
      while (!this.tokenStream.endOfStream && this.tokenStream.peek().type === 'digit') {
        n *= 10
        n += this.tokenStream.read().value
      }
      return {
        type: 'number',
        value: n
      }
    }

    // The keyword AST node is the token verbatum
    if (token.type === 'keyword') return token

    this.croak('(Possible) variable reference without "name", "rename"')
  }

  parseExpression () {
    const exp = this.mightBeBinary(this.parseAtom(), 0)
    // Expressions are ended with 'format it'
    // but we don't care, we can detect it with or without
    if (this.isNextWord('format')) {
      this.tokenStream.read()
    }
    return exp
  }

  mightBeBinary (leftNode, myPrecedence) {
    if (this.isNextOperator(true)) {
      const op = this.tokenStream.peek()
      const theirPrecedence = parserHelpers.operatorPrecedence[op.value]

      if (theirPrecedence > myPrecedence) {
        this.tokenStream.read()

        return this.mightBeBinary({
          type: 'binary',
          operator: op.value,
          left: leftNode,
          right: this.mightBeBinary(this.parseAtom(), theirPrecedence)
        }, myPrecedence)
      }
    }
    return leftNode
  }

  isNextOperator (binary) {
    if (this.tokenStream.endOfStream) return false
    const next = this.tokenStream.peek()
    return (next.type === 'operator' && next.binary === binary)
  }

  isNextWord (w) {
    if (this.tokenStream.endOfStream) return false
    const next = this.tokenStream.peek()
    return (next.type === 'keyword' && next.value === w)
  }

  expectNextWord (w) {
    if (!this.isNextWord(w)) {
      this.croak(`Expected keyword ${w}, got ${this.tokenStream.peek().value}`)
    }
    this.tokenStream.read()
  }

  croak (msg, source = 'Parser') {
    this.tokenStream.croak(msg, source)
  }
}

module.exports = Parser