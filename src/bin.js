import { defaultTo } from 'lodash'
import { BIN_DEFAULT } from './references.js'

// Transform user input into a args for child procress spawn
export const fromOptions = options => {
  return defaultTo(options.$bin, BIN_DEFAULT)
}
