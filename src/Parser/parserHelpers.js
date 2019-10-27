// Only lists binary operators
const operatorPrecedence = {
  '=': 1,
  '<': 7,
  '>': 7,
  '+': 15,
  '-': 10,
  '*': 20,
  '%': 20,
  '/f': 25, // Float division
  '/i': 25 // Integer (floor) division
}

module.exports = {
  operatorPrecedence
}
