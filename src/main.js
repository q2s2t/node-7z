import * as Lifecycle from './lifecycle.js'
import * as Bin from './bin.js'
import * as Args from './args.js'
import * as Flags from './flags.js'
import * as Parser from './parser.js'
import * as Events from './events.js'
import * as Err from './error.js'
import * as Lines from '../src/lines.js'
import * as Maybe from '../src/maybe.js'
import * as Commands from './commands.js'

// Expose the listen function to the API so a user can listen to a sdtio stream
// non emitted by the current (ie. in the run() function).
const listenFactory = ({ Lifecycle, Err, Lines, Maybe }) => seven => {
  Lifecycle.listenFactory({
    errorHandler: Events.onErrorFactory({ Err }),
    stderrHandler: Events.onStderrFactory({ Err }),
    stdoutHandler: Events.onStdoutFactory({ Lines, Maybe }),
    endHandler: Events.onEndFactory()
  })(seven)
  return seven
}

const listen = listenFactory({ Lifecycle, Err, Lines, Maybe })

// Function responsable for creating the streams using. Advanced usage of
// $childProcess and $defer is done at this stage.
const mainFactory = ({
  Lifecycle,
  Bin,
  Args,
  Flags,
  Parser,
  listen
}) => options => {
  const seven = Lifecycle.createFactory({ Bin, Args, Flags, Parser })(options)
  if (options.$childProcess) {
    seven._childProcess = options.$childProcess
  }
  if (!options.$defer) {
    Lifecycle.run(seven)
    listen(seven)
  }
  return seven
}

// Wire dependencies
const main = mainFactory({ Lifecycle, Bin, Args, Flags, Parser, listen })

// Public API
module.exports = {
  add: Commands.standardFactory({ main, command: 'add' }),
  delete: Commands.standardFactory({ main, command: 'delete' }),
  extract: Commands.extractFactory({ main, command: 'extract' }),
  extractFull: Commands.extractFactory({ main, command: 'extractFull' }),
  hash: Commands.simplexFactory({ main, command: 'hash' }),
  list: Commands.simplexFactory({ main, command: 'list' }),
  rename: Commands.standardFactory({ main, command: 'rename' }),
  test: Commands.simplexFactory({ main, command: 'test' }),
  update: Commands.standardFactory({ main, command: 'update' }),
  listenFactory,
  listen,
  mainFactory,
  main
}
