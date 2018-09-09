import { SevenZipStream } from './stream.js'
import { matchSymbolFileLine } from './parser.js'
import { onSpawnError, onSubprocessError } from './onError.js'
import { onSubprocessData } from './onData.js'

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
  opts._parser = function (line) {
    console.log('add-parser: %s', line) // @TODO
  }
  return new SevenZipStream(opts)
}

export function test (archive, options) {
  const opts = Object.assign({}, options)
  opts._commandArgs = ['t']
  opts._commandArgs.push(archive)
  opts._parser = matchSymbolFileLine
  const stream = new SevenZipStream(opts)

  // Handle events from child_process
  stream._childProcess.stdout.on('data', function (chunk) {
    onSubprocessData(stream, chunk)
  })
  stream._childProcess.stderr.on('data', function (chunk) {
    onSubprocessError(stream, chunk)
  })
  stream._childProcess.on('error', function (err) {
    onSpawnError(stream, err)
  })

  return stream
}
