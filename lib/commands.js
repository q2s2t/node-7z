import { SevenZipStream } from './stream.js'
import { matchSymbolFileLine } from './parser.js'
import { listenStdEvents } from './listeners.js'

/**
 * Add command
 * @param archive {String} Path to the archive
 * @param source {String|Array} Source to add
 * @param options {Object} An object of acceptable options to 7za bin.
 */
export function add (archive, source, options) {
  const opts = Object.assign({}, options)
  opts._commandArgs = ['a']
  opts._commandArgs.push(archive, source)
  opts._parser = matchSymbolFileLine
  const stream = new SevenZipStream(opts)
  listenStdEvents(stream)
  return stream
}

export function test (archive, options) {
  const opts = Object.assign({}, options)
  opts._commandArgs = ['t']
  opts._commandArgs.push(archive)
  opts._parser = matchSymbolFileLine
  const stream = new SevenZipStream(opts)
  listenStdEvents(stream)
  return stream
}
