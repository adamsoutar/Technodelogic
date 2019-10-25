class Interpreter {
  constructor (ast) {
    this.ast = ast
    this.lastExpression = null
    this.variables = {}
    this.stack = []
    this.insPointer = 0

    // Used to emulate blocking input
    this.inputStack = []
    this.setupStdin()
  }

  setupStdin () {
    const stdin = process.openStdin()
    stdin.addListener('data', data => this.inputStack.push)
  }

  runToEnd () {
    while (this.insPointer < this.ast.length) {
      const node = this.getNextNode()

      if (['number', 'binary', 'variable'].includes(node.type)) {
        this.lastExpression = node
      }

      if (node.type === 'keyword') {
        this.interpretKeyword(node.value)
      }
    }
    process.exit(0)
  }

  croak (msg, source = 'Interpreter') {
    throw new Error(`${source} croaked: ${msg}`)
  }

  interpretExpression (exp = this.lastExpression) {
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

      // Boolean operators
      // But everything's numbers, so I assume this works like C?
      case '==':
        return (left === right) ? 1 : 0
      case '<':
        return (left < right) ? 1 : 0
      case '>':
        return (left > right) ? 1 : 0
    }
  }

  getNextNode () {
    return this.ast[this.insPointer++]
  }

  readLine () {
    while (this.inputStack.length < 1) {}
    return this.inputStack.shift()
  }

  interpretKeyword (k) {
    switch (k) {
      case 'print':
        process.stdout.write(
          String.fromCharCode(this.interpretExpression())
        )
        break
      case 'send':
        process.stdout.write(this.interpretExpression())
        break
      case 'save':
        this.stack.push(this.interpretExpression())
        break
      case 'load':
        this.stack.pop()
        break
      case 'write':
        var vr = this.getNextNode()
        this.variables[vr.value] = this.interpretExpression()
        break
      case 'scan':
        var vr = this.getNextNode()
        this.variables[vr.value] = this.readLine()
        break
      case 'press':
        var vr = this.getNextNode()
        this.variables[vr.value] = this.readLine().charCodeAt(0)
        break
      default:
          this.croak(`Unimplemented keyword ${k}`)
    }
  }
}

module.exports = Interpreter
