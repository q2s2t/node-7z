import { onSubprocessData } from './onData.js'
import { onSpawnError, onSubprocessError } from './onError.js'

/**
 * Handle events from child_process
 * @param {SevenZipStream} stream
 */
export function listenStdEvents (stream) {
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
