import { INFOS, BODY_PROGRESS, BODY_SYMBOL_FILE, BODY_HASH, INFOS_SPLIT, END_OF_STAGE_DASH } from './regexp.js'
import { STAGE_BODY, STAGE_HEADERS } from './references.js'

export function matchBodyProgress (stream, line) {
  const isLineEmpty = (line.trim().length === 0)
  if (isLineEmpty) {
    return null
  }
  const match = line.match(BODY_PROGRESS)
  if (match) {
    return {
      percent: Number.parseInt(match.groups.percent),
      fileCount: Number.parseInt(match.groups.fileCount),
      file: match.groups.file
    }
  }
  return null
}

export function matchBodySymbol (stream, line) {
  const match = line.match(BODY_SYMBOL_FILE)
  if (match) {
    return match.groups
  }
  return null
}

export function matchBodyDash (stream, line) {
  const isLineEmpty = (line.trim().length === 0)
  if (isLineEmpty) {
    return null
  }
  const match = line.match(BODY_HASH)
  if (match) {
    return {
      hash: match.groups.hash,
      size: Number.parseInt(match.groups.size),
      file: match.groups.file
    }
  }
  return null
}

// Infos about the opertation are given by 7z on the stdout. They can be:
// - colon-seprated: `Creating archive: DirNew/BaseExt.7z`
// - equal-separated: `Method = LZMA2:12`
// - two on one line: `Prop 1: Data 1,  # Prop 2: Data 2`
// - in the HEADERS or in the FOOTERS
// This function match if the current line contains some infos. A **Map** is
// used to store infos in the stream.
export function matchInfos (stream, line) {
  const infos = line
    .split(INFOS_SPLIT)
    .map(res => res.match(INFOS))
    .filter(res => (res))
  if (infos.length === 0) {
    return null
  }
  for (let info of infos) {
    stream.info.set(info.groups.property, info.groups.value)
  }
  return stream
}

// This function determines if the end of the body section has been reached,
// an empty line is emited by 7z at the end of the body, so this function
// use this as an indicator.
// When the progress switch is activated the `formatByLine()` method adds
// additionnal empty lines: By adding a marker to the `SevenZipStream` object
// the function can detect two empty lines in a row.
export function matchEndOfBodySymbol (stream, line) {
  const isLineEmpty = (line === '')
  if (!isLineEmpty) {
    return false
  }
  if (!stream.switchProgress) {
    return true
  }
  const isLastLineEmpty = (stream._lastLineEmpty)
  if (isLastLineEmpty) {
    return true
  }
  stream._lastLineEmpty = true
  return false
}

// Some 7z commands uses a `--- -----` like string as a maker for the end of
// headers and the end of body. By adding a `_endOfHeadersMarker` to the
// stream we can know if the END_OF_SECTION match is for the end of HEADERS or
// the end of BODY
export function matchEndOfBodyDash (stream, line) {
  const isEndOfStage = END_OF_STAGE_DASH.test(line)
  if (!isEndOfStage) {
    return false
  }
  if (stream._stage === STAGE_HEADERS) {
    stream._stage = STAGE_BODY
    return false
  }
  return true
}

export function matchEndOfHeadersSymbol (stream, line) {
  return matchBodySymbol(stream, line)
}

export function matchEndOfHeadersDash (stream, line) {
  return END_OF_STAGE_DASH.test(line)
}
