export function onSubprocessError (stream, chunk) {
  const stderr = chunk.toString()
  const inLineErrorRegExp = /ERROR: (?<message>.*)\n/
  const offLineErrorRegExp = /(?<level>WARNING|ERROR): (?<message>.+)(\n(?<path>.+)\n)?/
  const inLineError = stderr.match(inLineErrorRegExp)
  const offLineError = stderr.match(offLineErrorRegExp)
  const err = new Error('unknown error')
  let errProps = {}
  errProps = (inLineError) ? inLineError.groups : errProps
  errProps = (offLineError) ? offLineError.groups : errProps
  Object.assign(err, errProps)
  err.stderr = stderr // @TODO doc: usage of raw stderr to get more info
  stream.emit('error', err)
  return stream
}

export function onSpawnError (stream, err) {
  stream.emit('error', err)
  return stream
}