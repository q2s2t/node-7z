import { spawn } from 'cross-spawn'
import { Readable } from 'stream'
import { STAGE_HEADERS, STAGE_BODY, STAGE_FOOTERS } from './references.js'
import { transformBinToString, transformSpecialArrayToArgs } from './special.js'
import { transformSwitchesToArgs } from './switches.js'
import { matchBodyProgress, matchBodyHash } from './parser.js'
import { LINE_SPLIT, END_OF_BODY_HASH } from './regexp.js'

/**
 * Wrapper around the `child_process.spawn()` call
 */
export class SevenZipStream extends Readable {
  constructor (options) {
    //@TODO must be called with the `new` operator
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
    this._matchHeaders = options._matchHeaders
    this._matchBody = options._matchBody
    this._matchFooters = options._matchFooters
    this._progressSwitch = args.includes('-bsp1')
    this._stage = STAGE_HEADERS
    this.info = {}

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
      stream.onSubprocessError(chunk)
    })
    stream._childProcess.on('error', function (err) {
      stream.onSpawnError(err)
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

  run () {
    this._spawn()
    this._listen()
  }

  addInfos (infos) {
    let stream = this
    infos.forEach(function (info) {
      Object.assign(stream.info, info)
    })
    return this
  }

  _formatByLine(chunkStrings) {
    const isPreviousLastLine = (this._lastLine)
    if (isPreviousLastLine) {
      chunkStrings[0] = this._lastLine.concat(chunkStrings[0])
    }
    const newLastLine = chunkStrings[chunkStrings.length - 1]
    const isNewLastLineComplete = (newLastLine.indexOf('\n') === newLastLine.length - 1)
    if (!isNewLastLineComplete) {
      this._lastLine = newLastLine
      chunkStrings.pop()
    } else {
      delete this._lastLine
    }
    return chunkStrings
  }

  // This function determines if the end of the body section has been reached,
  // an empty line is emited by 7z at the end of the body, so this function
  // use this as an indicator.
  // When the progress switch is activated the `formatByLine()` method adds
  // additionnal empty lines: By adding a marker to the `SevenZipStream` object
  // the function can detect two empty lines in a row.
  // Some 7z commands uses a `--- -----` like string as a maker for the end of 
  // body.
  _matchEndOfBody (line) {
    if (this._matchBody === matchBodyHash) {
      if (END_OF_BODY_HASH.test(line)) {
        return true
      }
      return false
    }

    const isLineEmpty = (line === '')
    if (!isLineEmpty) {
      return false
    }
    if (!this.switchProgress) {
      return true
    }
    const isLastLineEmpty = (this._endOfBodyMarker)
    if (isLastLineEmpty) {
      return true
    }
    this._endOfBodyMarker = true
    return false
  }

  onSubprocessData (chunkBuffer) {
    // Lines are separated by the END OF LINE symbol. When 7zip writes a 
    // progress value to stdout a new line is not created: Instead 7zip uses
    // a combination on backpaces and spaces char.
    const chunkStrings = chunkBuffer.toString().split(LINE_SPLIT)

    // Chunks of data aren't line-by-line, a chunk can begin and end in the
    // middle of line. The following code insure that if a line is not
    // complete it goes to the next stream
    let lines = this._formatByLine(chunkStrings)

    for (let line of lines) {

      if (this._stage === STAGE_HEADERS) {
        const matchHeaders = this._matchHeaders(line)
        if (matchHeaders) {
          this.addInfos(matchHeaders)
          continue
        }
      }

      // An empty line is created at the end of the listing of files. This empty
      // line means that 7zip has reached the end of the listing, and will next
      // outputs infos for the STAGE_FOOTERS.
      if (this._stage === STAGE_BODY) {
        if (this._matchEndOfBody(line)) {
          this._stage = STAGE_FOOTERS
          continue
        }
      }

      if (this._stage === STAGE_FOOTERS) {
        const matchFooters = this._matchFooters(line)
        if (matchFooters) {
          this.addInfos(matchFooters)
        }
        continue
      }

      const bodyProgress = matchBodyProgress(line)
      if (bodyProgress) {
        this.emit('progress', bodyProgress)
        continue
      }

      const bodyData = this._matchBody(line)
      if (bodyData) {
        this._stage = STAGE_BODY
        this.push(bodyData)
      }
    }

    return this
  }

  onSubprocessError (chunk) {
    const stderr = chunk.toString()
    const inLineErrorRegExp = /ERROR: (?<message>.*)\n/
    const offLineErrorRegExp = /(?<level>WARNING|ERROR): (?<message>.+)(\n(?<path>.+)\n)?/
    const inLineError = stderr.match(inLineErrorRegExp)
    const offLineError = stderr.match(offLineErrorRegExp)
    const err = new Error('unknown error')
    let errProps = {}
    errProps = (inLineError) ? inLineError.groups : errProps
    errProps = (offLineError) ? offLineError.groups : errProps
    Object.assign(err, errProps)
    err.stderr = stderr // @TODO doc: usage of raw stderr to get more info
    this.emit('error', err)
    return this
  }

  onSpawnError (err) {
    this.emit('error', err)
    return this
  }
}
