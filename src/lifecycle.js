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

import libdebug from 'debug'
import split2 from 'split2'
import { spawn } from 'child_process'
import { Readable } from 'stream'
import { STAGE_HEADERS } from './references.js'
const debug = libdebug('node-7z')

export const createFactory = ({
  Bin,
  Args,
  Flags,
  Parser
}) => (options) => {
  const seven = new Readable({
    highWaterMark: 16,
    objectMode: true,
    // On-demand reading not implemented because the source (ie: child_process)
    // can't be paused. If a stream can't be pause there is no point of
    // implementing on-demand `_read()` because this function is part of the
    // back pressure mekanism. SIDE-EFFECT: If the buffer fills, some data from
    // `stdout` can be lost: But given that it's only stdout from 7-Zip the risk
    // is fairly low.
    // [https://github.com/nodejs/help/issues/963#issuecomment-372007824]
    read () {}
  })

  seven._bin = Bin.fromOptions(options)
  seven._args = []
    .concat(Args.fromOptions(options))
    .concat(Flags.fromOptions(options))
  seven._isProgressFlag = seven._args.includes('-bsp1')
  seven._stage = STAGE_HEADERS
  seven._matchBodyData = Parser.fetch(options._command, 'bodyData')
  seven._matchEndOfHeaders = Parser.fetch(options._command, 'endOfHeaders')
  seven._matchEndOfBody = Parser.fetch(options._command, 'endOfBody')
  seven._dataType = Parser.fetch(options._command, 'dataType')
  seven._matchInfos = Parser.matchInfos
  seven._matchProgress = Parser.matchProgress
  seven.info = new Map()
  debug('lifecycle: create %O', options)
  return seven
}

export const listenFactory = ({
  errorHandler,
  stdoutHandler,
  stderrHandler,
  endHandler
}) => stream => {
  debug('lifecycle: listen')
  stream._childProcess.on('error', err => errorHandler(stream, err))
  stream._childProcess.stderr
    .pipe(split2())
    .on('data', chunk => stderrHandler(stream, chunk))
  stream._childProcess.stdout
    .pipe(split2())
    .on('data', chunk => stdoutHandler(stream, chunk))
  stream._childProcess.on('close', () => endHandler(stream))
  return stream
}

export const run = stream => {
  const spawnOptions = Object.assign({
    detached: true,
    windowsHide: true
  }, stream._spawnOptions)
  debug('lifecycle: spawn', stream._bin, stream._args, spawnOptions)
  stream._childProcess = spawn(stream._bin, stream._args, spawnOptions)
  return stream
}

export default { createFactory, listenFactory, run }
