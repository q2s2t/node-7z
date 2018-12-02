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

export const mainFactory = ({
  Lifecycle,
  Bin,
  Args,
  Flags,
  Parser,
  Events,
  Err,
  Lines,
  Maybe
}) => options => {
  const seven = Lifecycle.createFactory({ Bin, Args, Flags, Parser })(options)
  if (!options.$defer) {
    Lifecycle.run(seven)
    Lifecycle.listenFactory({
      errorHandler: Events.onErrorFactory({ Err }),
      stderrHandler: Events.onStderrFactory({ Err }),
      stdoutHandler: Events.onStdoutFactory({ Lines, Maybe }),
      endHandler: Events.onEndFactory()
    })(seven)
  }
  return seven
}

const main = mainFactory({ Lifecycle, Bin, Args, Flags, Parser, Events, Err, Lines, Maybe })

export default {
  add: Commands.addFactory({ createSeven: main }),
  delete: Commands.deleteFactory({ createSeven: main }),
  extract: Commands.extractFactory({ createSeven: main }),
  extractFull: Commands.extractFullFactory({ createSeven: main }),
  hash: Commands.hashFactory({ createSeven: main }),
  list: Commands.listFactory({ createSeven: main }),
  rename: Commands.renameFactory({ createSeven: main }),
  test: Commands.testFactory({ createSeven: main }),
  update: Commands.updateFactory({ createSeven: main })
}
