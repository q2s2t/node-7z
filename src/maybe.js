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

const debug = require('debug')('node-7z')
const { STAGE_HEADERS, STAGE_BODY, STAGE_FOOTERS } = require('./references')

const info = (stream, line) => {
  const stageWithInfo = (stream._stage === STAGE_HEADERS || stream._stage === STAGE_FOOTERS)
  if (!stageWithInfo) {
    return false
  } else {
    const infos = stream._matchInfos(stream, line)
    if (!infos) {
      return false
    } else {
      stream.info = new Map([...stream.info, ...infos])
      return true
    }
  }
}

const progress = (stream, line) => {
  const progress = stream._matchProgress(stream, line)
  if (!progress) {
    return false
  } else {
    debug('progress: %o', progress)
    stream.emit('progress', progress)
    return true
  }
}

const endOfHeaders = (stream, line) => {
  if (stream._stage !== STAGE_HEADERS) {
    return false
  } else {
    const match = stream._matchEndOfHeaders(stream, line)
    if (!match) {
      return false
    } else {
      debug('stream: END_OF_HEADERS')
      stream._stage = STAGE_BODY
      return true
    }
  }
}

const endOfBody = (stream, line) => {
  const match = stream._matchEndOfBody(stream, line)
  if (!match) {
    return false
  } else {
    debug('stream: END_OF_BODY')
    stream._stage = STAGE_FOOTERS
    return true
  }
}

const bodyData = (stream, line) => {
  const match = stream._matchBodyData(stream, line)
  if (!match) {
    return false
  } else {
    stream._stage = STAGE_BODY
    debug('data: %o', match)
    stream.push(match)
    return true
  }
}

module.exports = { info, progress, endOfHeaders, endOfBody, bodyData }
