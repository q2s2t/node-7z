import { SevenZipStream } from './stream.js'

//
// Stream API
// ==========
//

export function add (archive, source, options) {
  return getStreamSymbol('a', archive, source, options)._setSymbolParsers()
}

export function remove (archive, source, options) {
  return getStreamSymbol('d', archive, source, options)._setSymbolParsers()
}

export function extract (archive, output, cherryPick, options) {
  return getStreamExtract('e', archive, output, cherryPick, options)._setSymbolParsers()
}

export function extractFull (archive, output, cherryPick, options) {
  return getStreamExtract('x', archive, output, cherryPick, options)._setSymbolParsers()
}

export function hash (target, options) {
  return getStreamHash('h', target, options)._setHashParsers()
}

export function list (archive, target, options) {
  return getStreamSymbol('l', archive, target, options)._setListParsers()
}

export function rename (archive, renameList, options) {
  return getStreamRename('rn', archive, renameList, options)._setSymbolParsers()
}

//
// Library
// =======
//

function getStreamSymbol (commandLetter, archive, source, options) {
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

function getStreamRename (commandLetter, archive, replaceList, options) {
  let opts = Object.assign({}, options)
  opts._commandArgs = [commandLetter]
  opts._commandArgs.push(archive)
  for (let replace of replaceList) {
    opts = setTarget(opts, replace)
  }
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
