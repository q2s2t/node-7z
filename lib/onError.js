
/**
 * Regexp to be match againt stderr 
 */
const inLineErrorRegExp = /ERROR: (?<message>.*)\n/
const offLineErrorRegExp = /ERROR:\n(?<message>.*)\n/

/**
 * Error handling. An error from `stderr`
 * @param {SevenZipStream} stream Instance of the worker
 * @param {Error} chunk Error emitted by `child_process.spawn()`
 * @emits SevenZipStream#error
 */
export function onSubprocessError (stream, chunk) {
  const stderr = chunk.toString()
  const inLineError = stderr.match(inLineErrorRegExp)
  const offLineError = stderr.match(offLineErrorRegExp)
  let message = 'unknown error'
  message = (inLineError) ? inLineError.groups.message : message
  message = (offLineError) ? offLineError.groups.message : message
  const err = new Error(message)
  err.stderr = stderr // @TODO doc: usage of raw stderr to get more info
  stream.emit('error', err)
}

/**
 * Error handling. An error can be from the `spawn()` call
 * @param {SevenZipStream} stream Instance of the worker
 * @param {Error} err Error emitted by `child_process.spawn()`
 * @see https://nodejs.org/api/child_process.html#child_process_event_error
 * @emits SevenZipStream#error
 */
export function onSpawnError (stream, err) {
  stream.emit('error', err)
}
