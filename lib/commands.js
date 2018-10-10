import { SevenZipStream } from './stream.js'
import { matchPropsColon, matchPropsEquals, matchProgress } from './parser.js'

export function add (archive, source, options) {
  const opts = Object.assign({}, options)
  opts._commandArgs = ['a']
  opts._commandArgs.push(archive, source)
  opts._matchHeaders = matchPropsEquals
  opts._matchFiles = matchProgress
  opts._matchFooters = matchPropsColon
  const stream = new SevenZipStream(opts)
  return stream
}
