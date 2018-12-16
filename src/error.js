const { ERROR } = require('./regexp')

// Just assign an error to the stream. The event error is emitted on close
const assign = (stream, err) => {
  if (stream.err) {
    stream.err = Object.assign(err, stream.err)
  } else {
    stream.err = err
  }
  return stream
}

const fromBuffer = chunk => {
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

module.exports = { assign, fromBuffer }
