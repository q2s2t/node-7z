const debug = require('debug')('node-7z')
const spawn = require('cross-spawn')
const { Readable } = require('stream')
const { STAGE_HEADERS } = require('./references')

const createFactory = ({
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

const listenFactory = ({
  errorHandler,
  stdoutHandler,
  stderrHandler,
  endHandler
}) => stream => {
  stream._childProcess.on('error', err => errorHandler(stream, err))
  stream._childProcess.stderr.on('data', chunk => stderrHandler(stream, chunk))
  stream._childProcess.stdout.on('data', chunk => stdoutHandler(stream, chunk))
  stream._childProcess.on('close', () => endHandler(stream))
  return stream
}

const run = stream => {
  stream._childProcess = spawn(stream._bin, stream._args, { detached: true })
  return stream
}

module.exports = { createFactory, listenFactory, run }
