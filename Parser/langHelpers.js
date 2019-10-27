const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUV'
const numbers = '0123456789'
const identifierChars = letters.concat(numbers)
const meaningless = ['it', 'quick', 'mail']
const punctuation = '()'.split('')

const digits = ['erase', 'click', 'watch', 'view', 'work', 'surf', 'update', 'upgrade', 'zoom', 'fill', 'point']

const binaryOperators = {
  touch: '+',
  trash: '-',
  cross: '*',
  cut: '/f',
  crack: '/i',
  rip: '%',
  drag: '==',
  pay: '<',
  buy: '<',
  charge: '>'
}
const unaryOperators = {
  turn: '-',
  switch: '!',
  paste: 'paste' // Special stack-related "unary operator"
}
const operators = Object.keys(binaryOperators).concat(Object.keys(unaryOperators))

const keywords = `
name rename write drag and drop
 pay charge switch check break
 jam fix lock start leave burn
 find save load paste change
 scan press send print scroll format
 zip unzip use code call
`.replace(/\n/g, '').split(' ')
const synonyms = [
  ['fix', 'tune'],
  ['jam', 'snap'],
  ['write', 'rewrite'],
  ['check', 'rate']
]

const expressionKeywords = ['fax']

function replaceSynonym (w) {
  // Replace synonyms
  for (const s of synonyms) {
    if (w === s[1]) return s[0]
  }
  return w
}
function isKeyword (w) {
  return keywords.includes(w)
}
function isVariableName (w) {
  // Word must have *no* meaning in the language
  return !(isKeyword(w) || operators.includes(w) || digits.includes(w))
}

module.exports = {
  digits,
  binaryOperators,
  unaryOperators,
  isWhitespace: (x) => ' \r\n\t,-'.includes(x),
  isIdentifier: (x) => identifierChars.includes(x),

  isPunctuation: (w) => punctuation.includes(w),
  isWordMeaningless: (w) => meaningless.includes(w),
  isOperator: (w) => operators.includes(w),
  isDigit: (w) => digits.includes(w),
  isBinaryOperator: (w) => Object.keys(binaryOperators).includes(w),
  isExpressionKeyword: (w) => expressionKeywords.includes(w),
  isKeyword,
  isVariableName,
  replaceSynonym
}
