const readlineSync = require('readline-sync')

class Interpreter {
  constructor (ast) {
    this.ast = ast
    this.lastExpression = null
    this.variables = {}
    this.stack = []
    this.insPointer = 0

    console.dir(this.ast)
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
    throw new Error(`${source} croaked: ${msg}
At AST node:
${JSON.stringify(this.ast[this.insPointer], null, 2)}`)
  }

  interpretExpression (exp = this.lastExpression) {
    if (!exp) {
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
    // TODO: Get rid of this dependency/sort out better input
    //       it blocks background promises etc
    return readlineSync.question('>')
  }

  // Use 'acceptJam' for accepting a jump to else
  getIndexOfNextBreak (acceptElse) {
    // Gives the index of the next 'break it'
    let breakOffset = 0

    for (let i = this.insPointer; i < this.ast.length; i++) {
      const node = this.ast[i]

      if (node.value === 'check') breakOffset++
      if (node.value === 'fix') breakOffset--

      if (
        node.value === 'break' ||
        ((node.value === 'jam' || node.value === 'fix') && acceptElse)
      ) {
        if (breakOffset === 0) {
          return i
        } else breakOffset--
      }
    }
    this.croak("Couldn't find a matching 'break it' statement")
  }

  whileIshLoop (invertCond) {
    var cond = this.interpretExpression(this.ast[this.insPointer])
    if (invertCond) cond = cond === 0 ? 1 : 0

    if (cond === 0) {
      this.insPointer = this.getIndexOfNextBreak(false) + 1
    } else {
      // Entered loop
      this.insPointer += 2
    }
  }

  getIndexOfNthLabel (n) {
    if (n === 0) return this.ast.length

    let found = 0
    for (let i = 0; i < this.ast.length; i++) {
      const node = this.ast[n]
      if (node.type === 'label') {
        found++
        if (found === n) return i
      }
    }

    this.croak(`Attempted a 'technologic' jump to label ${n}, but it's too high`)
  }

  handleBreak (acceptIfs) {
    for (let i = this.insPointer - 2; i >= 0; i--) {
      const node = this.ast[i]

      if (node.value === 'check') {
        // Both loops & and ifs use 'check', we have to see if this is a loop
        // (unless we're at the start - edge case)
        if (i < 2) return i
        const prevNode = this.ast[i - 2]
        if (prevNode.value === 'lock' || prevNode.value === 'start') {
          // It's a loop
          this.insPointer = i - 2
          return
        } else {
          // It's an if statement
          if (!acceptIfs) continue
          this.insPointer = i
          return
        }
      }
    }

    this.croak("Hit 'break it' without a previous 'check it'")
  }

  interpretKeyword (k) {
    // console.log(`Evaluating ${this.insPointer - 1}: ${k}`)

    switch (k) {
      case 'print':
        process.stdout.write(
          String.fromCharCode(this.interpretExpression())
        )
        break
      case 'send':
        process.stdout.write(this.interpretExpression())
        break
      case 'scroll':
        process.stdout.write('\n')
        break
      case 'save':
        this.stack.push(this.interpretExpression())
        break
      case 'load':
        this.stack.pop()
        break
      case 'write':
        var vr1 = this.getNextNode()
        this.variables[vr1.value] = this.interpretExpression()
        break
      case 'scan':
        var vr2 = this.getNextNode()
        this.variables[vr2.value] = this.readLine()
        break
      case 'press':
        var vr3 = this.getNextNode()
        this.variables[vr3.value] = this.readLine().charCodeAt(0)
        break
      case 'burn':
        this.insPointer = this.ast.length
        break
      case 'check': // The if statement kind
        var cond = this.interpretExpression()
        if (cond === 0) {
          this.insPointer = this.getIndexOfNextBreak(true)
        }
        break
      case 'fix':
        // I don't *think* this needs any real implementation other than to
        // not trip on the keyword and treat it like a regular if
        break
      case 'lock':
        // While loop
        this.whileIshLoop(false)
        break
      case 'start':
        // Until-ish loop
        this.whileIshLoop(true)
        break
      case 'break':
        this.handleBreak(true)
        break
      case 'leave':
        this.handleBreak(false)
        break
      case 'find':
        var id = this.interpretExpression()
        this.insPointer = this.getIndexOfNthLabel(id)
        break
      default:
        this.croak(`Unimplemented keyword "${k}"`)
    }
  }
}

module.exports = Interpreter
