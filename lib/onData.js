import { STAGE_HEADERS, STAGE_FILES } from './references.js'

/**
 * Regexp to detect a progress vs. data
 */
const progressRegex = / *(?<percent>\d+)% (?<fileCount>\d+)$/

/**
 * Regexp to decte info vs. files
 */
const infoRegex = /^(?<property>.+) = (?<value>.+)$/

/**
 * Data handling.
 * @param {SevenZipStream} stream Instance of the worker
 * @param {Buffer} chunk Buffer from `stdout`
 * @emits SevenZipStream#progress
 */
export function onSubprocessData (stream, chunk) {
  let lines = chunk.toString().split('\n')

  // When the `-bsp1` switch is specified 7zip output a line
  // containing the progress percentage and the file count as far.
  lines.forEach(function (line) {
    const matchProgress = line.match(progressRegex)
    if (matchProgress) {
      stream.emit('progress', matchProgress.groups)
    }
  })

  // Chunks of data aren't line-by-line, a chunk can begin and end in the
  // middle of line. The following code insure that if a line is not
  // complete it goes to the next stream
  const isPreviousLastLine = (stream._lastLine)
  if (isPreviousLastLine) {
    lines[0] = stream._lastLine.concat(lines[0])
  }
  const newLastLine = lines[lines.length - 1]
  const isNewLastLineComplete = (newLastLine.indexOf('\n') === newLastLine.length - 1)
  if (!isNewLastLineComplete) {
    stream._lastLine = newLastLine
    lines.pop()
  } else {
    delete stream._lastLine
  }

  lines.forEach(function (line) {

    // Add info to steam. Only run the regexp when the stream is on 
    // `STAGE_HEADERS` for perf improvment
    if (stream._stage === STAGE_HEADERS) {
      const matchInfo = line.match(infoRegex)
      if (matchInfo) {
        stream.info[matchInfo.groups.property] = matchInfo.groups.value
      }
    }

    // Parser function call. Only push to stream when the parser return non-null
    // data. Pushing null will cause the stream to end.
    const matchParser = stream._parser(line)
    if (matchParser) {
      stream._stage = STAGE_FILES
      stream.push(matchParser)
    }
  })
}
