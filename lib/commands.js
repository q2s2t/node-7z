import { SevenZipStream } from './stream.js'
import { matchProps, matchProgress } from './parser.js'

function commandStandard (commandLetter, archive, source, options) {
  const opts = Object.assign({}, options)
  opts._commandArgs = [commandLetter]
  opts._commandArgs.push(archive)

  const isSourceMultiple = (Array.isArray(source))
  if (isSourceMultiple) {
    opts._commandArgs = opts._commandArgs.concat(source)
  } else {
    opts._commandArgs.push(source)
  }

  opts._matchHeaders = matchProps
  opts._matchFiles = matchProgress
  opts._matchFooters = matchProps
  const stream = new SevenZipStream(opts)
  return stream
}

export function add (archive, source, options) {
  return commandStandard('a', archive, source, options)
}

export function del (archive, source, options) {
  return commandStandard('d', archive, source, options)
}

export function extract (archive, output = '', target = '', options) {
  const opts = Object.assign({}, options)
  opts._commandArgs = ['e']
  const isDefaultOuput = (output === '')
  if (!isDefaultOuput) {
    opts['o'] = output
  }
  const isDefaultTarget = (target === '')
  if (!isDefaultTarget) {
    opts._commandArgs.push(archive)
  }

  const isTargetMultiple = (Array.isArray(target))
  if (isTargetMultiple) {
    opts._commandArgs = opts._commandArgs.concat(target)
  } else {
    opts._commandArgs.push(target)
  }

  opts._matchHeaders = matchProps
  opts._matchFiles = matchProgress
  opts._matchFooters = matchProps
  const stream = new SevenZipStream(opts)
  return stream
}
