import { SevenZipStream } from './stream.js'
import { matchProps, matchProgress } from './parser.js'

export function add (archive, source, options) {
  const opts = Object.assign({}, options)
  opts._commandArgs = ['a']
  opts._commandArgs.push(archive, source)
  opts._matchHeaders = matchProps
  opts._matchFiles = matchProgress
  opts._matchFooters = matchProps
  const stream = new SevenZipStream(opts)
  return stream
}
