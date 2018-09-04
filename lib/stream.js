import { spawn } from 'cross-spawn'
import { Readable } from 'stream'
import { highWaterMark } from './references.js'
import { transformPathToString, transformRawToArgs, transformWildCardsToArgs } from './special.js'
import { transformSwitchesToArgs } from './switches.js'
import { onSpawnError, onSubprocessError } from './onError.js'
import { onSubprocessData } from './onData.js'

/**
 * @TODO doc class
 */
export class SevenZipStream extends Readable {
  constructor (options) {
    options.highWaterMark = highWaterMark
    super(options)

    const stream = this
    stream._parser = options._parser

    // Compose child_process args
    const wildcards = transformWildCardsToArgs(options)
    const switches = transformSwitchesToArgs(options)
    const raw = transformRawToArgs(options)
    const pathSpawn = transformPathToString(options)
    const args = options._commandArgs
      .concat(wildcards)
      .concat(switches)
      .concat(raw)
    const childProcess = spawn(pathSpawn, args)

    // Handle events from child_process
    childProcess.stdout.on('data', function (chunk) {
      onSubprocessData(stream, chunk)
    })
    childProcess.stderr.on('data', function (chunk) {
      onSubprocessError(stream, chunk)
    })
    childProcess.on('error', function (err) {
      onSpawnError(stream, err)
    })
  }

  // @TODO on-demand reading?
  _read (size) {}
}
