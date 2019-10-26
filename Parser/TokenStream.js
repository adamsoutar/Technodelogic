const langHelpers = require('./LangHelpers')

class TokenStream {
  constructor (charStream) {
    this.charStream = charStream
    this.current = this.readNext()
  }

  getNextWord () {
    this.readWhile(langHelpers.isWhitespace)
    return this.readWhile(langHelpers.isIdentifier)
  }

  readNext () {
    this.readWhile(langHelpers.isWhitespace)
    if (this.charStream.endOfStream) return null

    if (langHelpers.isPunctuation(this.charStream.peek())) {
      return {
        type: 'punctuation',
        value: this.charStream.read()
      }
    }

    const word = langHelpers.replaceSynonym(this.getNextWord())

    // Filler words like quick- and it
    if (langHelpers.isWordMeaningless(word)) {
      return this.readNext()
    }

    // Jump-label
    if (word === 'technologic') {
      return {
        type: 'label'
      }
    }

    // TODO: pause it must end the line it's on etc
    // Comments
    if (word === 'pause') {
      while (!this.charStream.endOfStream) {
        this.readWhile(langHelpers.isWhitespace)
        const commentWord = this.getNextWord()
        if (commentWord === 'play') break
      }
      return this.readNext()
    }

    if (langHelpers.isDigit(word)) {
      // Keep trying to interpret a number
      return {
        type: 'digit',
        value: langHelpers.digits.indexOf(word)
      }
    }

    if (langHelpers.isOperator(word)) {
      if (langHelpers.isBinaryOperator(word)) {
        return {
          type: 'operator',
          binary: true,
          value: langHelpers.binaryOperators[word]
        }
      }
      return {
        type: 'operator',
        binary: false,
        value: langHelpers.unaryOperators[word]
      }
    }

    if (langHelpers.isKeyword(word)) {
      if (word === 'drag') {
        // Should always be followed by 'and drop',
        // so those can be abstracted from the parser
        const and = this.getNextWord()
        const drop = this.getNextWord()
        if (and !== 'and' || drop !== 'drop') {
          this.croak('Keyword "drag" must be followed by "and drop"')
        }
      }

      return {
        type: 'keyword',
        value: word
      }
    }

    // Because the tokeniser doesn't know where is appropriate
    // to write a var name, we must assume all unknown words in the
    // char stream are variable names, not syntax errors
    return {
      type: 'variable',
      value: word
    }
  }

  croak (msg, source = 'Tokeniser') {
    this.charStream.croak(msg, source)
  }

  readWhile (shouldConsume) {
    let final = ''
    while (!this.charStream.endOfStream) {
      if (!shouldConsume(this.charStream.peek())) break
      final += this.charStream.read()
    }
    return final
  }

  get endOfStream () {
    return this.current === null
  }

  peek () {
    return this.current
  }

  read () {
    const c = this.current
    this.current = this.readNext()
    return c
  }
}

module.exports = TokenStream
