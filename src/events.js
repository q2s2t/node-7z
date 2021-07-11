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
const { STAGE_BODY } = require('./references')

const onErrorFactory = ({ Err }) => (stream, err) => {
  Err.assign(stream, err)
  debug('error: from child process: %O', err)
  return stream
}

const onStderrFactory = ({ Err }) => (stream, buffer) => {
  const err = Err.fromBuffer(buffer)
  Err.assign(stream, err)
  debug('error: from stderr: %O', err)
  return stream
}

const onStdoutFactory = ({ Lines, Maybe }) => (stream, chunk) => {
  const lines = Lines.fromBuffer(stream, chunk)

  // Maybe functions check if a condition is true and run the corresponding
  // actions. They can mutate the stream, emit events, etc. The structure bellow
  // only does flow control.
  for (const line of lines) {
    debug('stdout: %s', line)

    // Infos about the opertation are given by 7z on the stdout. They can be:
    // - colon-seprated: `Creating archive: DirNew/BaseExt.7z`
    // - equal-separated: `Method = LZMA2:12`
    // - two on one line: `Prop 1: Data 1,  # Prop 2: Data 2`
    // - in the HEADERS or in the FOOTERS
    // stream function match if the current line contains some infos. A **Map**
    // is used to store infos in the stream.
    const infos = Maybe.info(stream, line)
    if (infos) {
      continue // at next line
    }

    // End of HEADERS can be easy to detected with list and hash commands that
    // outputs a `---- -- ----` line, but in symbol commands the end of HEADERS
    // can only be detected when the line match a BODY data: In such cases the
    // loop has to continue in order to properly porcess the BODY data.
    const endOfHeaders = Maybe.endOfHeaders(stream, line)
    if (endOfHeaders && stream._dataType !== 'symbol') {
      continue // at next line
    }

    // Optimization: Continue to the next line. At this point if the stream is
    // in stage BODY all data carried by the current line has been processed.
    const stageBody = (stream._stage === STAGE_BODY)
    if (!stageBody) {
      continue // at next line
    }

    const endOfBody = Maybe.endOfBody(stream, line)
    if (endOfBody) {
      continue // at next line
    }

    // Progress as a percentage is only displayed to stdout when the `-bsp1`
    // switch is specified. Progress can has several forms:
    // - only percent: `  0%`
    // - with file count: ` 23% 4`
    // - with file name: ` 23% 4 file.txt`
    const bodyProgress = Maybe.progress(stream, line)
    if (bodyProgress) {
      continue // at next line
    }

    Maybe.bodyData(stream, line)
  }
  return stream
}

const onEndFactory = () => (stream) => {
  if (stream.err) {
    stream.emit('error', stream.err)
  }
  stream.emit('end')
  return stream
}

module.exports = { onErrorFactory, onStderrFactory, onStdoutFactory, onEndFactory }
