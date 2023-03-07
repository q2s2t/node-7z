// Copyright (c) 2014-2019, Quentin Rossetti <quentin.rossetti@gmail.com>

// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.

// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

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

// Just append the buffer to the stream. The error is created before emitting on close
export const append = (stream, buffer) => {
  if (stream.stderr) {
    stream.stderr += buffer
  } else {
    stream.stderr = buffer
  }
  return stream
}

export const fromBuffer = chunk => {
  const stderr = chunk.toString()
  const match = stderr.match(ERROR)
  const err = new Error('unknown error')
  err.stderr = stderr
  if (match) {
    Object.assign(err, match.groups)
    err.level = err.level.toUpperCase()
  }
  return err
}

export default { append, assign, fromBuffer }
