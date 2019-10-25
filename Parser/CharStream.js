class CharStream {
  constructor (string) {
    this.string = string
    this.index = 0

    // Just for error messages
    this.line = 0
    this.char = 0
  }

  get endOfStream () {
    return this.index === this.string.length
  }

  peek () {
    return this.string[this.index]
  }

  read () {
    this.char++
    if (this.string[this.index] === '\n') {
      this.line++
      this.char = 0
    }
    return this.string[this.index++]
  }

  croak (msg, source = 'Character stream') {
    throw new Error(`${source} croaked at line ${this.line}, character ${this.char}
      ${msg}`)
  }
}

module.exports = CharStream
