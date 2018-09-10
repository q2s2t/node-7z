import { STAGE_HEADERS, STAGE_FILES, STAGE_FOOTER } from './references.js'
import { matchLine } from './parser.js'

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
    const matchProgress = matchLine(line, 'progress')
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
      const matchHeadersInfo = matchLine(line, 'infoHeaders')
      if (matchHeadersInfo) {
        stream.info[matchHeadersInfo.property] = matchHeadersInfo.value
        return
      }
    }

    // An empty line is created at the end of the listing of files. This empty
    // line means that 7zip has reached the end of the listing, and will next
    // outputs infos for the STAGE_FOOTER.
    if (stream._stage === STAGE_FILES) {
      const isLineEmpty = (line === '')
      if (isLineEmpty) {
        stream._stage = STAGE_FOOTER
      }
      return
    }

    // Add info to steam. Only run the regexp when the stream is on
    // `STAGE_FOOTER` for perf improvment
    if (stream._stage === STAGE_FOOTER) {
      const matchFooterInfo = matchLine(line, 'infoFooter')
      if (matchFooterInfo) {
        stream.info[matchFooterInfo.property] = matchFooterInfo.value
      }
      return
    }

    // Parser function call. Only push to stream when the parser return non-null
    // data. Pushing null will cause the stream to end.
    const matchFile = matchLine(line, stream._parser)
    if (matchFile) {
      stream._stage = STAGE_FILES
      stream.push(matchFile)
    }
  })
}
