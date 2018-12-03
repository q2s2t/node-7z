import { ERROR } from './regexp.js'

// Just assign an error to the stream. The event error is emitted on close
export const assign = (stream, err) => {
  if (stream.err) {
    stream.err = Object.assign(err, stream.err)
  } else {
    stream.err = err
  }
  return stream
}

export const fromBuffer = chunk => {
  const stderr = chunk.toString()
  const match = stderr.match(ERROR)
  let err = new Error('unknown error')
  err.stderr = stderr
  if (match) {
    Object.assign(err, match.groups)
    err.level = err.level.toUpperCase()
  }
  return err
}
