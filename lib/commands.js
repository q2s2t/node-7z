import { SevenZipStream } from './stream.js'

//
// Stream API
// ==========
//

export function add (archive, source, options) {
  return getStreamStandard('a', archive, source, options)._setStandardParsers()
}

export function remove (archive, source, options) {
  return getStreamStandard('d', archive, source, options)._setStandardParsers()
}

export function extract (archive, output, cherryPick, options) {
  return getStreamExtract('e', archive, output, cherryPick, options)._setStandardParsers()
}

export function extractFull (archive, output, cherryPick, options) {
  return getStreamExtract('x', archive, output, cherryPick, options)._setStandardParsers()
}

export function hash (target, options) {
  return getStreamHash('h', target, options)._setHashParsers()
}

export function list (archive, target, options) {
  return getStreamStandard('l', archive, target, options)._setListParsers()
}

//
// Library
// =======
//

function getStreamStandard (commandLetter, archive, source, options) {
  let opts = Object.assign({}, options)
  opts._commandArgs = [commandLetter]
  opts._commandArgs.push(archive)
  opts = setTarget(opts, source)
  let stream = new SevenZipStream(opts)
  return stream
}

function getStreamExtract (commandLetter, archive, output, target, options) {
  let opts = Object.assign({}, options)
  opts._commandArgs = [commandLetter]
  opts._commandArgs.push(archive)
  if (output) {
    opts['o'] = output
  }
  opts = setTarget(opts, target)
  let stream = new SevenZipStream(opts)
  return stream
}

function getStreamHash (commandLetter, target, options) {
  let opts = Object.assign({}, options)
  opts._commandArgs = [commandLetter]
  opts = setTarget(opts, target)
  return new SevenZipStream(opts)
}

function setTarget (opts, target) {
  const isTargetMultiple = (Array.isArray(target))
  if (isTargetMultiple) {
    opts._commandArgs = opts._commandArgs.concat(target)
  } else if (target) {
    opts._commandArgs.push(target)
  }
  return opts
}
