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

const standardFactory = ({ main, command }) => (archive, source, options = {}) => {
  const { ..._options } = options
  _options._command = command
  _options._target = [archive, source]
  return main(_options)
}

const extractFactory = ({ main, command }) => (archive, output, options = {}) => {
  const { ..._options } = options
  _options._command = command
  _options._target = [archive, options.$cherryPick]
  _options.outputDir = output
  return main(_options)
}

const simplexFactory = ({ main, command }) => (target, options = {}) => {
  const { ..._options } = options
  _options._command = command
  if (options.techInfo) {
    _options._command = 'listTechInfo'
  }
  _options._target = [target, options.$cherryPick]
  return main(_options)
}

module.exports = { standardFactory, extractFactory, simplexFactory }
