import { spawn } from 'cross-spawn'
import debugModule from 'debug'
import { Readable } from 'stream'
import {
  matchBodyProgress,
  matchInfos,
  matchBodySymbol,
  matchEndOfHeadersSymbol,
  matchEndOfBodySymbol,
  matchBodyHash,
  matchEndOfHeadersHyphen,
  matchEndOfBodyHyphen,
  matchBodyList
} from './parser.js'
import {
  STAGE_BODY,
  STAGE_FOOTERS,
  STAGE_HEADERS
} from './references.js'
import {
  LINE_SPLIT,
  ERR_ONE_LINE,
  ERR_MULTIPLE_LINE
} from './regexp.js'
import { transformBinToString, transformSpecialArrayToArgs } from './special.js'
import { transformSwitchesToArgs } from './switches.js'

const debug = debugModule('node-7z')

export class SevenZipStream extends Readable {
  constructor (options) {
    debug('stream: new SevenZipStream()')
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

  run () {
    this._spawn()
    this._listen()
    return this
  }

  // Run child process
  _spawn () {
    this._childProcess = spawn(this._binSpawn, this._args, {
      detached: true
    })
    return this
  }

  // Register listeners
  _listen () {
    const stream = this
    // Attach listeners @TODO end/close events
    const stdout = stream._childProcess.stdout
    const stderr = stream._childProcess.stderr
    stdout.on('data', function (chunk) {
      stream._onSubprocessData(chunk)
    })
    stdout.on('end', function () {
      stream.emit('end')
    })
    stderr.on('data', function (chunk) {
      stream._onSubprocessError(stream, chunk)
    })
    stream._childProcess.on('error', function (err) {
      stream._onSpawnError(stream, err)
    })
    return this
  }

  // On-demand reading not implemented because the source (ie: child_process)
  // can't be paused. If a stream can't be pause there is no point of
  // implementing on-demand `_read()` because this function is part of the
  // back pressure mekanism. SIDE-EFFECT: If the buffer fills, some data from
  // `stdout` can be lost.
  // [https://github.com/nodejs/help/issues/963#issuecomment-372007824]
  _read (size) {}

  _setSymbolParsers () {
    this._matchBodyData = matchBodySymbol
    this._matchEndOfHeaders = matchEndOfHeadersSymbol
    this._matchEndOfBody = matchEndOfBodySymbol
    return this
  }

  _setHashParsers () {
    this._matchBodyData = matchBodyHash
    this._matchEndOfHeaders = matchEndOfHeadersHyphen
    this._matchEndOfBody = matchEndOfBodyHyphen
    return this
  }

  _setListParsers () {
    this._matchBodyData = matchBodyList
    this._matchEndOfHeaders = matchEndOfHeadersHyphen
    this._matchEndOfBody = matchEndOfBodyHyphen
    return this
  }
  // Analyse each line of the current data buffer. If the current line match a
  // given condition (e.g: line is a progress value) the current iteration of
  // the loop will stop and the next line is analysed from the top of the loop
  _onSubprocessData (buffer) {
    const lines = this._transformBufferToLines(buffer)

    for (let line of lines) {
      debug('stdout: %s', line)

      const maybeLineInfo = this._maybeInfo(line)
      if (maybeLineInfo) {
        continue
      }

      const maybeLineEndOfHeaders = this._maybeEndOfHeaders(line)
      if (maybeLineEndOfHeaders) {
        continue
      }

      const maybeStageBody = (this._stage === STAGE_BODY)
      if (!maybeStageBody) {
        continue
      }

      const maybeLineEndOfBody = this._maybeEndOfBody(line)
      if (maybeLineEndOfBody) {
        continue
      }

      const maybeLineBodyProgress = this._maybeBodyProgress(line)
      if (maybeLineBodyProgress) {
        continue
      }

      this._maybeBodyData(line)
    }

    return this
  }

  // Chunks of data aren't line-by-line, a chunk can begin and end in the
  // middle of line. The following code insure that if a line is not
  // complete it goes to the next stream
  // Lines are separated by the END OF LINE symbol. When 7zip writes a
  // progress value to stdout a new line is not created: Instead 7zip uses
  // a combination on backpaces and spaces char.
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

  _maybeBodyProgress (line) {
    const match = matchBodyProgress(this, line)
    if (match) {
      debug('progress: %o', match)
      this.emit('progress', match)
      return true
    }
    return false
  }

  _maybeInfo (line) {
    if (this._stage === STAGE_HEADERS || this._stage === STAGE_FOOTERS) {
      const match = matchInfos(this, line)
      if (match) {
        this.info = new Map([...this.info, ...match])
        return true
      }
    }
    return false
  }

  _maybeEndOfHeaders (line) {
    if (this._stage === STAGE_HEADERS) {
      const match = this._matchEndOfHeaders(this, line)
      if (match) {
        debug('stream: END_OF_HEADERS')
        this._stage = STAGE_BODY
        return true
      }
    }
    return false
  }

  _maybeEndOfBody (line) {
    const match = this._matchEndOfBody(this, line)
    if (match) {
      debug('stream: END_OF_BODY')
      this._stage = STAGE_FOOTERS
      return true
    }
    return false
  }

  _maybeBodyData (line) {
    const match = this._matchBodyData(this, line)
    if (match) {
      debug('data: %o', match)
      this.push(match)
      return true
    }
    return false
  }

  _onSubprocessError (stream, chunk) {
    const stderr = chunk.toString()
    const inLineError = stderr.match(ERR_ONE_LINE)
    const offLineError = stderr.match(ERR_MULTIPLE_LINE)
    const err = new Error('unknown error')
    let errProps = {}
    errProps = (inLineError) ? inLineError.groups : errProps
    errProps = (offLineError) ? offLineError.groups : errProps
    Object.assign(err, errProps)
    err.stderr = stderr // @TODO doc: usage of raw stderr to get more info
    stream.emit('error', err)
    return stream
  }

  _onSpawnError (stream, err) {
    stream.emit('error', err)
    return stream
  }
}
