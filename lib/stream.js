import { spawn } from 'cross-spawn'
import { Readable } from 'stream'
import { STAGE_HEADERS, STAGE_FILES, STAGE_FOOTERS } from './references.js'
import { transformBinToString, transformSpecialArrayToArgs } from './special.js'
import { transformSwitchesToArgs } from './switches.js'
import { matchProgress } from './parser.js'
import { add } from './infos.js'

/**
 * Wrapper around the `child_process.spawn()` call
 */
export class SevenZipStream extends Readable {
  constructor (options) {
    options.highWaterMark = 16
    options.objectMode = true
    super(options)

    const stream = this
    stream._matchHeaders = options._matchHeaders
    stream._matchFiles = options._matchFiles
    stream._matchFooters = options._matchFooters
    stream._stage = STAGE_HEADERS
    stream.info = {}

    // Compose child_process args
    const wildcards = transformSpecialArrayToArgs(options, '$wildcards')
    const raw = transformSpecialArrayToArgs(options, '$raw')
    const switches = transformSwitchesToArgs(options)
    const binSpawn = transformBinToString(options)
    const args = options._commandArgs
      .concat(wildcards)
      .concat(switches)
      .concat(raw)
    stream._binSpawn = binSpawn
    stream._args = args
    stream._childProcess = options.$childProcess

    // When $differ option is specified the stream is constructed but the
    // child_process is not spawned, nor the llisteners are attached. It allows 
    // easier testing with mock stdout and some advanced usages.
    if (!options.$defer) {
      stream.spawn()
      stream.listen()
    }

    return stream
  }

  // On-demand reading not implemented because the source (ie: child_process)
  // can't be paused. If a stream can't be pause there is no point of
  // implementing on-demand `_read()` because this function is part of the
  // back pressure mekanism. SIDE-EFFECT: If the buffer fills, some data from
  // `stdout` can be lost.
  // [https://github.com/nodejs/help/issues/963#issuecomment-372007824]
  _read (size) {}

  // Register listeners
  listen () {
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
  spawn () {
    this._childProcess = spawn(this._binSpawn, this._args, {
      detached: true
    })
    return this
  }

  addInfos (infos) {
    let stream = this
    infos.forEach(function (info) {
      Object.assign(stream.info, info)
    })
    return this
  }

  formatByLine(chunkStrings) {
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

  onSubprocessData (chunkBuffer) {
    const stream = this

    // Lines are separated by the END OF LINE symbol. When 7zip writes a 
    // progress value to stdout a new line is not created: Instead 7zip uses
    // a combination on backpaces and spaces char.
    const chunkStrings = chunkBuffer.toString().split(/\n|\x08/)

    // Chunks of data aren't line-by-line, a chunk can begin and end in the
    // middle of line. The following code insure that if a line is not
    // complete it goes to the next stream
    let lines = this.formatByLine(chunkStrings)

    // When the `-bsp1` switch is specified 7zip output a line
    // containing the progress percentage and the file count as far.
    lines.forEach(function (line) {
      const progress = matchProgress(line)
      if (progress) {
        stream.emit('progress', progress)
      
        const isSymbolFile = (progress.symbol && progress.file)
        if (isSymbolFile) {
          stream._stage = STAGE_FILES
          stream.push(progress)
          return
        }
      }

      // Add info to steam. Only run the regexp when the stream is on
      // `STAGE_HEADERS` for perf improvment
      if (stream._stage === STAGE_HEADERS) {
        const matchHeaders = stream._matchHeaders(line)
        if (matchHeaders) {
          stream.addInfos(matchHeaders)
          return
        }
      }

      // An empty line is created at the end of the listing of files. This empty
      // line means that 7zip has reached the end of the listing, and will next
      // outputs infos for the STAGE_FOOTERS.
      if (stream._stage === STAGE_FILES) {
        const isLineEmpty = (line === '')
        if (isLineEmpty) {
          stream._stage = STAGE_FOOTERS
        }
        return
      }

      // Add info to steam. Only run the regexp when the stream is on
      // `STAGE_FOOTERS` for perf improvment
      if (stream._stage === STAGE_FOOTERS) {
        const matchFooters = stream._matchFooters(line)
        if (matchFooters) {
          stream.addInfos(matchFooters)
        }
        return
      }

    })

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
