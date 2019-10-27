const DummyTokenStream = require('./DummyTokenStream')
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

  isNextPunctuation (val) {
    const token = this.tokenStream.peek()
    return (token.type === 'punctuation' && token.value === val)
  }

  expectPunctuation (x) {
    if (!this.isNextPunctuation(x)) {
      this.croak(`Expected punctuation ${x}, got ${JSON.stringify(this.tokenStream.peek())}`)
    }
    this.tokenStream.read()
  }

  // Parses arguments and function name
  getFunctionDetails () {
    const tokenArgs = []
    let currentArg = []
    let funcName = ''

    while (true) {
      currentArg.push(this.tokenStream.read())

      // Next word
      const nw = this.tokenStream.peek().value
      if (
        nw === 'bring' || nw === 'plug'
      ) {
        tokenArgs.push(currentArg)
        currentArg = []

        this.tokenStream.read()
      }

      // name
      const nm = this.tokenStream.peek().rawIdentifier
      if (nm === 'code' || nm === 'call') break

      funcName = nm
    }

    const callOrCode = this.tokenStream.peek()
    if (callOrCode.value === 'code') {
      return {
        name: funcName,
        args: tokenArgs.map(tA => {
          return {
            type: 'variable',
            value: tA[0].rawIdentifier
          }
        })
      }
    } else if (callOrCode.value === 'call') {
      // Turn the list of arguments (which are each lists of tokens)
      // into a 1-dimensional list of expressions
      const args = []
      for (const tA of tokenArgs) {
        // tA is a list of raw tokens, we need to turn it into 1 expression
        const tS = new DummyTokenStream(tA)
        const temp = this.tokenStream
        this.tokenStream = tS
        args.push(this.parseExpression())
        this.tokenStream = temp
      }
      return {
        name: funcName,
        args
      }
    } else {
      this.croak("Function arguments must be followed by 'call it' or 'code it'")
    }
  }

  parseAtom (inArgumentList = false) {
    if (this.isNextWord('zip')) {
      // Bracketed expression like (2 + 3) * 4
      this.tokenStream.read()
      const exp = this.parseExpression()
      this.expectNextWord('unzip')
      return this.mightBeUnary(exp)
    }

    if (this.isNextWord('use')) {
      // Function definition or call
      this.tokenStream.read()
      const { args, name } = this.getFunctionDetails()

      let type = ''

      if (this.isNextWord('code')) {
        type = 'functionDefinition'
      } else if (this.isNextWord('call')) {
        type = 'functionCall'
      } else {
        this.croak('Function line ("use it, args... name") must be followed by "call it" or "code it"')
      }
      this.tokenStream.read()

      return {
        type,
        args,
        name
      }
    }

    if (this.isNextWord('name')) {
      this.tokenStream.read()
      const varToken = this.tokenStream.read()
      this.expectNextWord('rename')
      return {
        type: 'variable',
        value: varToken.rawIdentifier
      }
    }

    const token = this.tokenStream.read()

    if (token.type === 'digit') {
      // Let's assemble a number!
      let n = `${token.value}`
      while (!this.tokenStream.endOfStream && this.tokenStream.peek().type === 'digit') {
        const val = this.tokenStream.read().value
        n += val === 10 ? '.' : val
      }
      return {
        type: 'number',
        value: parseFloat(n)
      }
    }

    // The keyword AST node for these is the token verbatum
    if (
      token.type === 'keyword' ||
      token.type === 'label' ||
      token.type === 'expressionKeyword'
    ) {
      return token
    }

    if (inArgumentList) {
      return {
        type: 'argumentVariable',
        value: token.value
      }
    }
    this.croak(`Unexpected identifier "${token.value}"
If you are referencing a variable, it must be in the format
  name it, ${token.value}, rename it`)
  }

  parseExpression (inArgumentList = false) {
    const exp = this.mightBeUnary(
      this.mightBeBinary(
        this.parseAtom(inArgumentList), 0
      )
    )
    // Expressions are ended with 'format it'
    // but we don't care, we can detect it with or without
    if (this.isNextWord('format')) {
      this.tokenStream.read()
    }
    return exp
  }

  mightBeUnary (node) {
    if (this.isNextOperator(false)) {
      const op = this.tokenStream.read()
      return {
        type: 'unary',
        operator: op.value,
        node
      }
    }
    return node
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
