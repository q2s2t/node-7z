import { SevenZipStream } from './stream.js'
import { matchProps, matchProgress } from './parser.js'

export function add (archive, source, options) {
  const opts = Object.assign({}, options)
  opts._commandArgs = ['a']
  opts._commandArgs.push(archive)

  const isSourceMultiple = (Array.isArray(source))
  if (isSourceMultiple) {
    opts._commandArgs = opts._commandArgs.concat(source)
  } else {
    opts._commandArgs.push(source)
  }

  opts._matchHeaders = matchProps
  opts._matchFiles = matchProgress
  opts._matchFooters = matchProps
  const stream = new SevenZipStream(opts)
  return stream
}
