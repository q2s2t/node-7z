import { INFOS, BODY_PROGRESS, BODY_SYMBOL_FILE, BODY_HASH, INFOS_SPLIT, END_OF_STAGE_HYPHEN } from './regexp.js'
import { STAGE_BODY, STAGE_HEADERS } from './references.js'

// Infos about the opertation are given by 7z on the stdout. They can be:
// - colon-seprated: `Creating archive: DirNew/BaseExt.7z`
// - equal-separated: `Method = LZMA2:12`
// - two on one line: `Prop 1: Data 1,  # Prop 2: Data 2`
// - in the HEADERS or in the FOOTERS
// This function match if the current line contains some infos. A **Map** is
// used to store infos in the stream.
export function matchInfos (stream, line) {
  const infosLine = line
    .split(INFOS_SPLIT)
    .map(res => res.match(INFOS))
    .filter(res => (res))
  if (infosLine.length === 0) {
    return null
  }
  const infos = new Map()
  for (let info of infosLine) {
    infos.set(info.groups.property, info.groups.value)
  }
  return infos
}

// Most 7z commands doesn't outputs a specific marker for the end of headers.
// Instead we can check if the line is a match for body.
// The end of headers for commands that uses `matchBodySymbol()` is only
// delimited by a `matchBodySymbol() === true`. Retunring a truthly value would
// cause the current loop iteration to end and doing so missing to push the
// current line to the stream, so we have to push in here.
export function matchEndOfHeadersSymbol (stream, line) {
  return stream._maybeBodyData(line)
}

// Some 7z commands uses a `--- -----` like string as a maker for the end of
// headers and the end of headers.
export function matchEndOfHeadersHyphen (stream, line) {
  const isEnd = END_OF_STAGE_HYPHEN.test(line)
  if (isEnd) {
    return line
  } else {
    return null
  }
}

// Progress as a percentage is only displayed to stdout when the `-bsp1` switch
// is specified. Progress can has several forms:
// - only percent: `  0%`
// - with file count: ` 23% 4`
// - with file name: ` 23% 4 file.txt`
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

// Most 7z command outputs body as a symbol-filename pair. The symbol is an
// unique character that represents the state of the opertaion applied by the
// command to the file. E.g.:
// - testing file: `T file/to/test.txt`
// - adding file to archive: `+ file/to/add.txt`
export function matchBodySymbol (stream, line) {
  const match = line.match(BODY_SYMBOL_FILE)
  if (match) {
    return match.groups
  }
  return null
}

// Hash command outputs body as a hash-size-filename trio. Some data can be
// empty. E.g.:
// - hash with all info: `hebdf6      43      hashed/file.txt`
// - hash with some info: `hebdf6              hashed/file.txt`
// - hash for directories: `                    hashed/file.txt`
export function matchBodyHash (stream, line) {
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

// This function determines if the end of the body section has been reached,
// an empty line is emited by 7z at the end of the body, so this function
// use this as an indicator.
// When the progress switch is activated the `formatByLine()` method adds
// additionnal empty lines: By adding a marker to the `SevenZipStream` object
// the function can detect two empty lines in a row.
export function matchEndOfBodySymbol (stream, line) {
  const isLineEmpty = (line.trim().length === 0)
  if (!isLineEmpty) {
    return null
  }
  if (!stream._progressSwitch) {
    return true
  }
  const isLastLineEmpty = (stream._lastLineEmpty)
  if (isLastLineEmpty) {
    return true
  }
  stream._lastLineEmpty = true
  return null
}

// Some 7z commands uses a `--- -----` like string as a maker for the end of
// headers and the end of body. Using the `stream._stage` value stream we can
// know if the END_OF_STAGE match is for the end of HEADERS or the end of BODY
export function matchEndOfBodyHyphen (stream, line) {
  const isEndOfStage = END_OF_STAGE_HYPHEN.test(line)
  if (!isEndOfStage) {
    return null
  }
  if (stream._stage === STAGE_HEADERS) {
    stream._stage = STAGE_BODY
    return null
  }
  return line
}
