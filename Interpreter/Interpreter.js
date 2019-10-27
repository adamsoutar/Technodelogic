const util = require('util')
const readlineSync = require('readline-sync')

function stringFullObject (obj) {
  return util.inspect(obj, { depth: null, colors: true })
}

class Interpreter {
  constructor (ast) {
    this.ast = ast
    this.lastExpression = null
    this.globals = {}
    this.stack = []
    this.insPointer = 0
    this.callStack = []
    this.definedFunctions = {}
    this.lastReturnValue = 0

    console.log(stringFullObject(this.ast))
  }

  runToEnd () {
    while (this.insPointer < this.ast.length) {
      this.handleNextNode()
    }
    process.exit(0)
  }

  handleNextNode () {
    // console.log(`Eval node ${this.insPointer}`)
    const node = this.getNextNode()

    // Expression
    if (['number', 'binary', 'unary', 'variable', 'functionCall'].includes(node.type)) {
      this.lastExpression = this.interpretExpression(node)
    }

    if (node.type === 'keyword') {
      this.interpretKeyword(node.value)
    }

    if (node.type === 'functionDefinition') {
      this.definedFunctions[node.name] = {
        astIndex: this.insPointer - 1,
        // Used to determine whether technologic jumps are legal
        // (you can't jump in/out of a function for scope reasons)
        endsAt: this.getIndexOfNextBreak(false),
        args: node.args
      }
      this.insPointer = this.getIndexOfNextBreak(false) + 1
    }
  }

  handleFunctionCall (node) {
    // console.log(`Function call ${stringFullObject(node)}`)

    if (!Object.keys(this.definedFunctions).includes(node.name)) {
      this.croak(`Attempted to call function "${node.name}" before it was defined`)
    }

    const func = this.definedFunctions[node.name]
    if (func.args.length !== node.args.length) {
      this.croak(`Called "${node.name}" with ${node.args.length} arguments when it wanted ${func.args.length}`)
    }

    // Construct scope from arguments
    const scope = {}
    for (let i = 0; i < func.args.length; i++) {
      scope[func.args[i].value] = this.interpretExpression(node.args[i])
    }

    this.callStack.push({
      calledFrom: this.insPointer - 1,
      scope
    })
    const sL = this.callStack.length
    this.insPointer = func.astIndex + 1

    // Run until this function returns to get its result
    while (this.callStack.length === sL) {
      this.handleNextNode()
    }
    return this.lastReturnValue
  }

  croak (msg, source = 'Interpreter') {
    throw new Error(`${source} croaked: ${msg}
At AST node:
${stringFullObject(this.ast[this.insPointer - 1])}`)
  }

  getScope () {
    // Call stack holds scope
    if (this.callStack.length > 0) {
      const { scope } = this.callStack[this.callStack.length - 1]
      return scope
    }
    return {}
  }

  isInScope (varName) {
    return Object.keys(this.getScope()).includes(varName)
  }

  getVariable (varName) {
    if (this.isInScope(varName)) {
      const scope = this.getScope()
      return scope[varName]
    }
    return this.globals[varName]
  }

  setVariable (varName, value) {
    if (this.isInScope(varName)) {
      this.callStack[this.callStack.length - 1].scope[varName] = value
    }
    this.globals[varName] = value
  }

  interpretExpression (exp = -1) {
    if (exp === -1) {
      if (!this.lastExpression) {
        this.croak('Called something like print without a previously evaluated expression')
      }
      return this.lastExpression
    }

    switch (exp.type) {
      case 'number':
        return exp.value
      case 'variable':
        return this.getVariable(exp.value)
      case 'binary':
        return this.interpretBinary(exp)
      case 'unary':
        return this.interpretUnary(exp)
      case 'expressionKeyword':
        // They had to come up with a special type of keyword and use it once
        // in the entire spec, didn't they
        // Currently the only one is 'fax', so that's what's "hard-coded" here,
        // but it's easy to account for new ones
        if (exp.value !== 'fax') {
          this.croak('Unimplemented expression keyword')
        }
        return this.stack.pop()
      case 'functionCall':
        return this.handleFunctionCall(exp)
    }

    this.croak(`Unimplemented expression type "${exp.type}"`)
  }

  interpretUnary (una) {
    const node = this.interpretExpression(una.node)

    switch (una.operator) {
      case '-':
        return -node
      case '!':
        return node === 0 ? 1 : 0
      case 'paste':
        return this.setStackItem(node)
      case 'return':
        this.doReturn(node)
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

  // Use 'acceptElse' for accepting a jump to else
  getIndexOfNextBreak (acceptElse) {
    // Gives the index of the next 'break it'
    let breakOffset = 0

    for (let i = this.insPointer; i < this.ast.length; i++) {
      const node = this.ast[i]

      if (
        node.value === 'check' ||
        node.value === 'functionDefinition'
      ) breakOffset++
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
    let ignores = 0
    for (let i = this.insPointer - 2; i >= 0; i--) {
      const node = this.ast[i]

      if (node.value === 'break') ignores++

      if (node.value === 'check') {
        if (ignores > 0) {
          ignores--
          continue
        }
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

      if (node.value === 'functionDefinition') {
        if (ignores > 0) {
          ignores--
          continue
        }
        // Hit break at the end of a function,
        // Need to return
        this.doReturn(0)
      }
    }

    this.croak("Hit 'break it' without a previous 'check it'")
  }

  doReturn (value) {
    this.lastReturnValue = value
    this.insPointer = this.callStack.pop().calledFrom + 1
  }

  setStackItem (n, value) {
    if (n < 0 || n >= this.stack.length) {
      this.croak('Attempted to write to a non-existant stack index')
    }

    // The stack is indexed from the top being 0
    this.stack[this.stack.length - 1 - n] = value
  }

  interpretKeyword (k) {
    switch (k) {
      case 'print':
        process.stdout.write(
          String.fromCharCode(this.interpretExpression())
        )
        break
      case 'send':
        process.stdout.write(this.interpretExpression().toString())
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
      case 'change':
        var nxt = this.interpretExpression(this.getNextNode())
        this.setStackItem(nxt, this.interpretExpression())
        break
      case 'write':
        var vr1 = this.getNextNode()
        this.setVariable(vr1.value, this.interpretExpression())
        break
      case 'scan':
        var vr2 = this.getNextNode()
        this.setVariable(vr2.value, this.readLine())
        break
      case 'press':
        var vr3 = this.getNextNode()
        this.setVariable(vr3.value, this.readLine().charCodeAt(0))
        break
      case 'burn':
        this.insPointer = this.ast.length
        break
      case 'check': // The if statement kind
        var cond = this.interpretExpression()
        if (cond === 0) {
          this.insPointer = this.getIndexOfNextBreak(true) + 1
        }
        break
      case 'fix':
        // We ran into an else case from the body of an if,
        // skip over the case
        this.insPointer = this.getIndexOfNextBreak(false) + 1
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
