import { SevenZipStream } from './stream.js'
import {
  matchBodyHash,
  matchBodyList,
  matchBodySymbol,
  matchEndOfBodyHyphen,
  matchEndOfBodySymbol,
  matchEndOfHeadersHyphen,
  matchEndOfHeadersSymbol
} from './parser.js'

function setTarget (opts, target) {
  const isTargetMultiple = (Array.isArray(target))
  if (isTargetMultiple) {
    opts._commandArgs = opts._commandArgs.concat(target)
  } else if (target) {
    opts._commandArgs.push(target)
  }
  return opts
}

function commandStandard (commandLetter, archive, source, options) {
  let opts = Object.assign({}, options)
  opts._commandArgs = [commandLetter]
  opts._commandArgs.push(archive)
  opts = setTarget(opts, source)
  opts._matchBodyData = matchBodySymbol
  opts._matchEndOfHeaders = matchEndOfHeadersSymbol
  opts._matchEndOfBody = matchEndOfBodySymbol
  const stream = new SevenZipStream(opts)
  return stream
}

function commandExtract (commandLetter, archive, output, target, options) {
  let opts = Object.assign({}, options)
  opts._commandArgs = [commandLetter]
  opts._commandArgs.push(archive)
  if (output) {
    opts['o'] = output
  }
  opts = setTarget(opts, target)
  opts._matchBodyData = matchBodySymbol
  opts._matchEndOfHeaders = matchEndOfHeadersSymbol
  opts._matchEndOfBody = matchEndOfBodySymbol
  const stream = new SevenZipStream(opts)
  return stream
}

function commandHash (commandLetter, target, options) {
  let opts = Object.assign({}, options)
  opts._commandArgs = [commandLetter]
  opts = setTarget(opts, target)
  opts._matchBodyData = matchBodyHash
  opts._matchEndOfHeaders = matchEndOfHeadersHyphen
  opts._matchEndOfBody = matchEndOfBodyHyphen
  const stream = new SevenZipStream(opts)
  return stream
}

function commandList (commandLetter, archive, source, options) {
  let opts = Object.assign({}, options)
  opts._commandArgs = [commandLetter]
  opts._commandArgs.push(archive)
  opts = setTarget(opts, source)
  opts._matchBodyData = matchBodyList
  opts._matchEndOfHeaders = matchEndOfHeadersHyphen
  opts._matchEndOfBody = matchEndOfBodyHyphen
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

export function list (archive, target, options) {
  return commandList('l', archive, target, options)
}
