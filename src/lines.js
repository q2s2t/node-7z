const { LINE_SPLIT } = require('./regexp')

// Transform a Buffer into an Array of complete lines.
// Chunks of data aren't line-by-line, a chunk can begin and end in the middle
// of line. The following code insure that if a line is not complete it goes to
// the next stream push. Lines are separated by the END OF LINE char.
// When 7zip writes a progress value to stdout a new line is not created:
// Instead 7zip uses combination on backpaces and spaces char.
const fromBuffer = (seven, buffer) => {
  const lines = buffer.toString().split(LINE_SPLIT)
  if (seven._lastLinePartial) {
    lines[0] = seven._lastLinePartial.concat(lines[0])
  }
  const newLastLine = lines[lines.length - 1]
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
