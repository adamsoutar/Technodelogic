class DummyTokenStream {
  constructor (tokens) {
    this.tokens = tokens
    this.index = 0
  }

  peek () {
    return this.tokens[this.index]
  }

  read () {
    return this.tokens[this.index++]
  }

  get endOfStream () {
    return this.index === this.tokens.length
  }
}

module.exports = DummyTokenStream
