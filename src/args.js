import { flattenDeep, negate, isEmpty } from 'lodash'
import { COMMAND_LETTERS } from './references.js'

// Transform user input into a args for child procress spawn
export const fromOptions = options => {
  return [COMMAND_LETTERS[options._command]]
    .concat(flattenDeep(options._target))
    .filter(negate(isEmpty))
}
