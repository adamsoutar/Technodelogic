class Interpreter {
  constructor (ast) {
    this.ast = ast
    this.lastExpression = null
    this.variables = {}
    this.stack = []
    this.insPointer = 0
  }

  runToEnd () {
    while (this.insPointer < this.ast.length) {
      const node = this.ast[i]

      if (['number', 'binary', 'variable'].includes(node.type)) {
        this.lastExpression = node
      }

      if (node.type === 'keyword') {
        this.interpretKeyword(node.value)
      }

      this.insPointer++
    }
  }

  croak (msg, source = 'Interpreter') {
    throw new Error(`${source} croaked: ${msg}`)
  }

  interpretExpression (exp) {
    if (!this.lastExpression) {
      this.croak('Called something like print without a previously evaluated expression')
    }

    switch (exp.type) {
      case 'number':
        return exp.value
      case 'variable':
        return this.variables[exp.value]
      case 'binary':
        return this.interpretBinary(exp)
    }
  }
  interpretBinary (bin) {
    const left = this.interpretExpression(bin.left)
    const right = this.interpretExpression(bin.right)

    switch (bin.operator) {
      case '+':
        return left + right
      case '-':
        return left - right
      case '*':
        return left * right
      case '/f':
        return left / right
      case '/i':
        return Math.floor(left / right)
      case '%':
        return left % right
    }
  }

  interpretKeyword (k) {
    switch (k) {
      case 'print':
        process.stdout.write(
          String.fromCharCode(this.interpretExpression(this.lastExpression))
        )
        break
      case 'save':
        this.stack.push(this.interpretExpression(this.lastExpression))
        break
      case 'load':
        this.stack.pop()
        break
    }

    this.croak(`Unimplemented keyword ${k}`)
  }
}

module.exports = Interpreter
