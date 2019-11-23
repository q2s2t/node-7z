// Copyright (c) 2014-2019, Quentin Rossetti <quentin.rossetti@gmail.com>

// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.

// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

const Lifecycle = require('./lifecycle')
const Bin = require('./bin')
const Args = require('./args')
const Flags = require('./flags')
const Parser = require('./parser')
const Events = require('./events')
const Err = require('./error')
const Lines = require('../src/lines')
const Maybe = require('../src/maybe')
const Commands = require('./commands')

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
