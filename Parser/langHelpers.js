const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUV'
const numbers = '0123456789'
const identifierChars = letters.concat(numbers)
const meaningless = ['it', 'quick', 'mail']
const punctuation = '()'.split('')

const operators = ['touch', 'trash', 'cross', 'cut', 'crack', 'rip', 'turn']
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
  charge: '>'
}
const unaryOperators = {
  turn: '-',
  switch: '!'
}

const keywords = `
name rename write drag and drop
 pay charge switch check break
 jam fix lock start leave burn
 find save load fax paste change
 scan press send print scroll format
 zip unzip
`.replace(/\n/g, '').split(' ')
const synonyms = [
  ['fix', 'tune'],
  ['jam', 'snap'],
  ['pay', 'buy'],
  ['write', 'rewrite'],
  ['check', 'rate']
]

function isKeyword (w) {
  // Replace synonyms
  for (const s of synonyms) {
    if (w === s[1]) w = s[0]
  }
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
  isKeyword,
  isVariableName
}
