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

const normalizePath = require('normalize-path')
const { INFOS, BODY_PROGRESS, BODY_SYMBOL_FILE, BODY_HASH, INFOS_SPLIT, INFOS_PATH, END_OF_STAGE_HYPHEN, END_OF_TECH_INFOS_HEADERS } = require('./regexp')
const { SYMBOL_OPERATIONS } = require('./references')

// Infos about the opertation are given by 7z on the stdout. They can be:
// - colon-seprated: `Creating archive: DirNew/BaseExt.7z`
// - equal-separated: `Method = LZMA2:12`
// - two on one line: `Prop 1: Data 1,  # Prop 2: Data 2`
// - in the HEADERS or in the FOOTERS
// This function match if the current line contains some infos. A **Map** is
// used to store infos in the stream.
function matchInfos (stream, line) {
  const infosLine = line
    .split(INFOS_SPLIT)
    .map(res => res.match(INFOS))
    .filter(res => (res))
  if (infosLine.length === 0) {
    return null
  }
  const infos = new Map()
  for (const info of infosLine) {
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
function matchEndOfHeadersSymbol (stream, line) {
  return stream._matchBodyData(stream, line)
}

// Some 7z commands uses a `--- -----` like string as a maker for the end of
// headers and the end of headers. The position of spaces are saved in the
// stream to be exploited by the `matchBodyList()` function
function matchEndOfHeadersHyphen (stream, line) {
  const isEnd = END_OF_STAGE_HYPHEN.test(line)
  if (isEnd) {
    stream._columnsPositions = Array.from(line)
      .map(getSpacesPosition)
      .filter(Number.isInteger)
    return line
  }
  return null
}

function matchEndOfHeadersTechInfo (stream, line) {
  const isEnd = END_OF_TECH_INFOS_HEADERS.test(line)
  if (isEnd) {
    return line
  }
  return null
}

// Progress as a percentage is only displayed to stdout when the `-bsp1` switch
// is specified. Progress can has several forms:
// - only percent: `  0%`
// - with file count: ` 23% 4`
// - with file name: ` 23% 4 file.txt`
function matchProgress (stream, line) {
  if (isEmpty(line)) {
    return null
  }
  const match = line.match(BODY_PROGRESS)
  if (match) {
    return {
      percent: Number.parseInt(match.groups.percent),
      fileCount: Number.parseInt(match.groups.fileCount),
      file: normalizePath(match.groups.file)
    }
  }
  return null
}

// Most 7z command outputs body as a symbol-filename pair. The symbol is an
// unique character that represents the state of the opertaion applied by the
// command to the file. E.g.:
// - testing file: `T file/to/test.txt`
// - adding file to archive: `+ file/to/add.txt`
function matchBodySymbol (stream, line) {
  const match = line.match(BODY_SYMBOL_FILE)
  if (match) {
    match.groups.file = normalizePath(match.groups.file)
    const data = {
      symbol: match.groups.symbol,
      file: normalizePath(match.groups.file),
      status: SYMBOL_OPERATIONS[match.groups.symbol]
    }
    return data
  }
  return null
}

// 7z list command ouptuts lines that looks like this:
// 2018-09-29 09:06:15 ....A            9           24  DirHex/42550418a4ef9
// The caveat is that each value can be empty. So we don't use a Regexp but
// the values of were the columns are to split the line into an object.
function matchBodyList (stream, line) {
  const raw = {}
  try {
    const columns = stream._columnsPositions
    raw.datetime = line.substring(0, columns[0])
    raw.attributes = line.substring(columns[0], columns[1])
    raw.size = line.substring(columns[1], columns[2])
    raw.sizeCompressed = line.substring(columns[2], columns[3])
    raw.file = line.substring(columns[3])
  } catch (err) {
    return null
  }
  const datetime = (!isEmpty(raw.datetime)) ? new Date(Date.parse(raw.datetime)) : undefined
  const attributes = (!isEmpty(raw.attributes)) ? raw.attributes.trim() : undefined
  const size = (!isEmpty(raw.size)) ? Number.parseInt(raw.size) : undefined
  const sizeCompressed = (!isEmpty(raw.sizeCompressed)) ? Number.parseInt(raw.sizeCompressed) : undefined
  const file = (!isEmpty(raw.file)) ? normalizePath(raw.file.trim()) : undefined
  return { datetime, attributes, size, sizeCompressed, file }
}

// Hash command outputs body as a hash-size-filename trio. Some data can be
// empty. E.g.:
// - hash with all info: `hebdf6      43      hashed/file.txt`
// - hash with some info: `hebdf6              hashed/file.txt`
// - hash for directories: `                    hashed/file.txt`
function matchBodyHash (stream, line) {
  if (isEmpty(line)) {
    return null
  }
  const match = line.match(BODY_HASH)
  if (match) {
    return {
      hash: match.groups.hash,
      size: Number.parseInt(match.groups.size),
      file: normalizePath(match.groups.file)
    }
  }
  return null
}

// List command with -slt switch. This commands outputs multiples lines per
// file. E.g.:
// Path = DirImages/LICENSE
// Size = 37
// Packed Size = 18292718
// Modified = 2018-10-02 21:45:49
// Attributes = A_ -rw-r--r--
// CRC = F303F60C
// Encrypted = -
// Method = LZMA2:24
// Block = 0
// *Path* is the first and *Block* is the last so we use that to mark the end 
// of data. The end of the output is marked by 2 empty lines
function matchBodyTechInfo (stream, line) {
  if (!stream._lastLines) {
    stream._lastLines = ['', '']
  }
  stream._lastLines[1] = stream._lastLines[0]
  stream._lastLines[0] = line

  if (isEmpty(line)) {
    if (isEmpty(stream._lastLines[1])) {
      return null
    }
    return {
      file: stream._lastTechInfo.get('Path'),
      techInfo: stream._lastTechInfo
    }
  }
  const match = line.match(INFOS)
  if (match) {
    if (match.groups.property === 'Path') {
      stream._lastTechInfo = new Map()
      match.groups.value = normalizePath(match.groups.value)
    }
    stream._lastTechInfo.set(match.groups.property, match.groups.value)
  }
  return null
}

// This function determines if the end of the body section has been reached,
// an empty line is emited by 7z at the end of the body, so this function
// use this as an indicator.
// When the progress switch is activated the `formatByLine()` method adds
// additionnal empty lines: By adding a marker to the `SevenZipStream` object
// the function can detect two empty lines in a row.
function matchEndOfBodySymbol (stream, line) {
  const isLastLineEmpty = (stream._lastLineEmpty)
  if (!isEmpty(line)) {
    stream._lastLineEmpty = false
    return null
  } else if (!stream._isProgressFlag) {
    return true
  } else if (isLastLineEmpty) {
    return true
  } else {
    stream._lastLineEmpty = true
    return null
  }
}

function getSpacesPosition (char, indexOfChar) {
  return (char === ' ') ? indexOfChar : null
}

function isEmpty (string) {
  return (string.trim().length === 0)
}

// Given a command, the formating of STAGES HEADERS, BODY and FOOTERS differs,
// so each command as it's particular set of parser functions. ie:
// - To identify the end of the BODY stage a list command outputs a
// `---- -- --- ---` line.
// - An extract command outpus the FOOTERS after after an empty line.
const fetch = (command, parser) => {
  const PARSERS = {
    add: {
      bodyData: matchBodySymbol,
      endOfHeaders: matchEndOfHeadersSymbol,
      endOfBody: matchEndOfBodySymbol,
      dataType: 'symbol'
    },
    delete: {
      bodyData: matchBodySymbol,
      endOfHeaders: matchEndOfHeadersSymbol,
      endOfBody: matchEndOfBodySymbol,
      dataType: 'symbol'
    },
    extract: {
      bodyData: matchBodySymbol,
      endOfHeaders: matchEndOfHeadersSymbol,
      endOfBody: matchEndOfBodySymbol,
      dataType: 'symbol'
    },
    extractFull: {
      bodyData: matchBodySymbol,
      endOfHeaders: matchEndOfHeadersSymbol,
      endOfBody: matchEndOfBodySymbol,
      dataType: 'symbol'
    },
    hash: {
      bodyData: matchBodyHash,
      endOfHeaders: matchEndOfHeadersHyphen,
      endOfBody: matchEndOfHeadersHyphen,
      dataType: 'table'
    },
    list: {
      bodyData: matchBodyList,
      endOfHeaders: matchEndOfHeadersHyphen,
      endOfBody: matchEndOfHeadersHyphen,
      dataType: 'table'
    },
    listTechInfo: {
      bodyData: matchBodyTechInfo,
      endOfHeaders: matchEndOfHeadersTechInfo,
      endOfBody: matchEndOfHeadersHyphen,
      dataType: 'showTechInfo'
    },
    rename: {
      bodyData: matchBodySymbol,
      endOfHeaders: matchEndOfHeadersSymbol,
      endOfBody: matchEndOfBodySymbol,
      dataType: 'symbol'
    },
    test: {
      bodyData: matchBodySymbol,
      endOfHeaders: matchEndOfHeadersSymbol,
      endOfBody: matchEndOfBodySymbol,
      dataType: 'symbol'
    },
    update: {
      bodyData: matchBodySymbol,
      endOfHeaders: matchEndOfHeadersSymbol,
      endOfBody: matchEndOfBodySymbol,
      dataType: 'symbol'
    }
  }
  return PARSERS[command][parser]
}

module.exports = {
  matchInfos,
  matchEndOfHeadersSymbol,
  matchEndOfHeadersHyphen,
  matchEndOfHeadersTechInfo,
  matchProgress,
  matchBodySymbol,
  matchBodyList,
  matchBodyHash,
  matchBodyTechInfo,
  matchEndOfBodySymbol,
  fetch
}
