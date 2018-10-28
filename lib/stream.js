import { spawn } from 'cross-spawn'
import debugModule from 'debug'
import { Readable } from 'stream'
import { matchBodyProgress, matchInfos } from './parser.js'
import { STAGE_BODY, STAGE_FOOTERS, STAGE_HEADERS } from './references.js'
import { LINE_SPLIT } from './regexp.js'
import { transformBinToString, transformSpecialArrayToArgs } from './special.js'
import { transformSwitchesToArgs } from './switches.js'
import { onSpawnError, onSubprocessError } from './onError.js'

const debug = debugModule('node-7z')

/**
 * Wrapper around the `child_process.spawn()` call
 */
export class SevenZipStream extends Readable {
  constructor (options) {
    debug('new SevenZipStream()')
    // @TODO must be called with the `new` operator
    options.highWaterMark = 16
    options.objectMode = true
    super(options)

    // Compose child_process args
    const wildcards = transformSpecialArrayToArgs(options, '$wildcards')
    const raw = transformSpecialArrayToArgs(options, '$raw')
    const switches = transformSwitchesToArgs(options)
    const binSpawn = transformBinToString(options)
    const args = options._commandArgs
      .concat(wildcards)
      .concat(switches)
      .concat(raw)
    this._binSpawn = binSpawn
    this._args = args
    this._childProcess = options.$childProcess
    this._matchBody = options._matchBody
    this._matchEndOfHeaders = options._matchEndOfHeaders
    this._matchEndOfBody = options._matchEndOfBody
    this._progressSwitch = args.includes('-bsp1')
    this._stage = STAGE_HEADERS
    this.info = new Map()

    // When $defer option is specified the stream is constructed but the
    // child_process is not spawned, nor the listeners are attached. It allows
    // easier testing with mock stdout and some advanced usages.
    if (!options.$defer) {
      this.run()
    }

    return this
  }

  // On-demand reading not implemented because the source (ie: child_process)
  // can't be paused. If a stream can't be pause there is no point of
  // implementing on-demand `_read()` because this function is part of the
  // back pressure mekanism. SIDE-EFFECT: If the buffer fills, some data from
  // `stdout` can be lost.
  // [https://github.com/nodejs/help/issues/963#issuecomment-372007824]
  _read (size) {}

  // Register listeners
  _listen () {
    const stream = this
    // Attach listeners @TODO end/close events
    const stdout = stream._childProcess.stdout
    const stderr = stream._childProcess.stderr
    stdout.on('data', function (chunk) {
      stream.onSubprocessData(chunk)
    })
    stdout.on('end', function () {
      stream.emit('end')
    })
    stderr.on('data', function (chunk) {
      onSubprocessError(stream, chunk)
    })
    stream._childProcess.on('error', function (err) {
      onSpawnError(stream, err)
    })
    return this
  }

  // Run child process
  _spawn () {
    this._childProcess = spawn(this._binSpawn, this._args, {
      detached: true
    })
    return this
  }

  // Chunks of data aren't line-by-line, a chunk can begin and end in the
  // middle of line. The following code insure that if a line is not
  // complete it goes to the next stream
  _transformBufferToLines (buffer) {
    const lines = buffer.toString().split(LINE_SPLIT)
    if (this._lastLinePartial) {
      lines[0] = this._lastLinePartial.concat(lines[0])
    }
    const newLastLine = lines[lines.length - 1]
    const isNewLastLineComplete = (newLastLine.indexOf('\n') === newLastLine.length - 1)
    if (!isNewLastLineComplete) {
      this._lastLinePartial = newLastLine
      lines.pop()
    } else {
      delete this._lastLinePartial
    }
    return lines
  }

  onSubprocessData (buffer) {
    // Lines are separated by the END OF LINE symbol. When 7zip writes a
    // progress value to stdout a new line is not created: Instead 7zip uses
    // a combination on backpaces and spaces char.

    let lines = this._transformBufferToLines(buffer)

    for (let line of lines) {
      debug('stdout: %s', line)

      if (this._stage === STAGE_HEADERS || this._stage === STAGE_FOOTERS) {
        const match = matchInfos(this, line)
        if (match) {
          continue
        }
      }

      if (this._stage === STAGE_HEADERS) {
        const isEndOfHeaders = this._matchEndOfHeaders(this, line)
        if (isEndOfHeaders) {
          this._stage = STAGE_BODY
          // The end of headers for commands that uses `matchBodySymbol()` is
          // only delimited by a `matchBodySymbol() === true`.
          // Do not `continue`: It would cause the current loop iteration to end
          // and doing so missing to push the current line to the stream.
        }
      }

      if (this._stage === STAGE_BODY) {
        const isEndOfBody = this._matchEndOfBody(this, line)
        if (isEndOfBody) {
          this._stage = STAGE_FOOTERS
          continue
        }
      }

      const bodyProgress = matchBodyProgress(this, line)
      if (bodyProgress) {
        debug('progress: %o', bodyProgress)
        this.emit('progress', bodyProgress)
        continue
      }
      const bodyData = this._matchBody(this, line)
      if (bodyData) {
        debug('data: %o', bodyData)
        this.push(bodyData)
      }
    }

    return this
  }

  run () {
    this._spawn()
    this._listen()
  }
}
