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

const { LINE_SPLIT } = require('./regexp')

// Transform a Buffer into an Array of complete lines.
// Chunks of data aren't line-by-line, a chunk can begin and end in the middle
// of line. The following code insure that if a line is not complete it goes to
// the next stream push. Lines are separated by the END OF LINE char.
// When 7zip writes a progress value to stdout a new line is not created:
// Instead 7zip uses combination on backpaces and spaces char.
const fromBuffer = (seven, buffer) => {
  if (seven._lastLinePartial) {
    buffer = Buffer.concat([seven._lastLinePartial, buffer])
  }
  const lines = buffer.toString().split(LINE_SPLIT)
  const offset = buffer.lastIndexOf('\n') + 1
  const newLastLine = buffer.slice(offset)
  const isNewLastLineComplete = (newLastLine.indexOf('\n') === newLastLine.length - 1)
  
  if (!isNewLastLineComplete) {
    seven._lastLinePartial = newLastLine
    lines.pop()
  } else {
    delete seven._lastLinePartial
  }
  return lines
}

module.exports = { fromBuffer }
