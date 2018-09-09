import { spawn } from 'cross-spawn'
import { Readable } from 'stream'
import { transformPathToString, transformRawToArgs, transformWildCardsToArgs } from './special.js'
import { transformSwitchesToArgs } from './switches.js'
import { STAGE_HEADERS } from './references.js'

/**
 * Wrapper around the `child_process.spawn()` call
 */
export class SevenZipStream extends Readable {
  constructor (options) {
    options.highWaterMark = 16
    options.objectMode = true
    super(options)

    const stream = this
    stream._parser = options._parser
    stream._stage = STAGE_HEADERS
    stream.info = {}

    // Compose child_process args
    const wildcards = transformWildCardsToArgs(options)
    const switches = transformSwitchesToArgs(options)
    const raw = transformRawToArgs(options)
    const pathSpawn = transformPathToString(options)
    const args = options._commandArgs
      .concat(wildcards)
      .concat(switches)
      .concat(raw)
    stream._childProcess = spawn(pathSpawn, args)

    return stream
  }

  // On-demand reading not implemented because the source (ie: child_process)
  // can't be paused. If a stream can't be pause there is no point of
  // implementing on-demand `_read()` because this function is part of the
  // back pressure mekanism. SIDE-EFFECT: If the buffer fills, some data from
  // `stdout` can be lost.
  // [https://github.com/nodejs/help/issues/963#issuecomment-372007824]
  _read (size) {}
}
