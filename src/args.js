const flattenDeep = require('lodash/flattenDeep')
const negate = require('lodash/negate')
const isEmpty = require('lodash/isEmpty')
const { COMMAND_LETTERS } = require('./references')

// Transform user input into a args for child procress spawn
const fromOptions = options => {
  return [COMMAND_LETTERS[options._command]]
    .concat(flattenDeep(options._target))
    .filter(negate(isEmpty))
}

module.exports = { fromOptions }
