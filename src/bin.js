const defaultTo = require('lodash/defaultTo')
const { BIN_DEFAULT } = require('./references')

// Transform user input into a args for child procress spawn
const fromOptions = options => {
  return defaultTo(options.$bin, BIN_DEFAULT)
}

module.exports = { fromOptions }
