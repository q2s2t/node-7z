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
  _options._target = [target, options.$cherryPick]
  return main(_options)
}

module.exports = { standardFactory, extractFactory, simplexFactory }
