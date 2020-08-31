module.exports = {
  TLQueryOperators:`
    input TLQueryOperators<T> {
      _or: [T]
      _and: [T]
      _nor: [T]
    }
  `
}