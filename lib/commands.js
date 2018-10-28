import { SevenZipStream } from './stream.js'
import { matchInfos, matchBodySymbolFile, matchBodyHash } from './parser.js'

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

  opts._matchHeaders = matchInfos
  opts._matchBody = matchBodySymbolFile
  opts._matchFooters = matchInfos
  const stream = new SevenZipStream(opts)
  return stream
}

function commandExtract (commandLetter, archive, output, target, options) {
  const opts = Object.assign({}, options)
  opts._commandArgs = [commandLetter]
  opts._commandArgs.push(archive)
  if (output) {
    opts['o'] = output
  }

  const isTargetMultiple = (Array.isArray(target))
  if (isTargetMultiple) {
    opts._commandArgs = opts._commandArgs.concat(target)
  } else if (target) {
    opts._commandArgs.push(target)
  }

  opts._matchHeaders = matchInfos
  opts._matchBody = matchBodySymbolFile
  opts._matchFooters = matchInfos
  const stream = new SevenZipStream(opts)
  return stream
}

function commandHash (commandLetter, target, options) {
  const opts = Object.assign({}, options)
  opts._commandArgs = [commandLetter]

  const isTargetMultiple = (Array.isArray(target))
  if (isTargetMultiple) {
    opts._commandArgs = opts._commandArgs.concat(target)
  } else if (target) {
    opts._commandArgs.push(target)
  }

  opts._matchHeaders = matchInfos
  opts._matchBody = matchBodyHash
  opts._matchFooters = matchInfos
  const stream = new SevenZipStream(opts)
  return stream
}

export function add (archive, source, options) {
  return commandStandard('a', archive, source, options)
}

export function remove (archive, source, options) {
  return commandStandard('d', archive, source, options)
}

export function extract (archive, output, cherryPick, options) {
  return commandExtract('e', archive, output, cherryPick, options)
}

export function extractFull (archive, output, cherryPick, options) {
  return commandExtract('x', archive, output, cherryPick, options)
}

export function hash (target, options) {
  return commandHash('h', target, options)
}
