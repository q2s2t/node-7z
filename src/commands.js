
export const addFactory = ({ createSeven }) => (archive, source, options = {}) => {
  const { ..._options } = options
  _options._command = 'add'
  _options._target = [archive, source]
  return createSeven(_options)
}

export const deleteFactory = ({ createSeven }) => (archive, source, options = {}) => {
  const { ..._options } = options
  _options._command = 'delete'
  _options._target = [archive, source]
  return createSeven(_options)
}

export const extractFactory = ({ createSeven }) => (archive, output, options = {}) => {
  const { ..._options } = options
  _options._command = 'extract'
  _options._target = [archive, options.$cherryPick]
  _options.outputDir = output
  return createSeven(_options)
}

export const extractFullFactory = ({ createSeven }) => (archive, output, options = {}) => {
  const { ..._options } = options
  _options._command = 'extractFull'
  _options._target = [archive, options.$cherryPick]
  _options.outputDir = output
  return createSeven(_options)
}

export const hashFactory = ({ createSeven }) => (target, options = {}) => {
  const { ..._options } = options
  _options._command = 'hash'
  _options._target = [target]
  return createSeven(_options)
}

export const listFactory = ({ createSeven }) => (archive, options = {}) => {
  const { ..._options } = options
  _options._command = 'list'
  _options._target = [archive, options.$cherryPick]
  return createSeven(_options)
}

export const renameFactory = ({ createSeven }) => (archive, renameList, options = {}) => {
  const { ..._options } = options
  _options._command = 'rename'
  _options._target = [archive, renameList]
  return createSeven(_options)
}

export const testFactory = ({ createSeven }) => (archive, options = {}) => {
  const { ..._options } = options
  _options._command = 'test'
  _options._target = [archive, options.$cherryPick]
  return createSeven(_options)
}

export const updateFactory = ({ createSeven }) => (archive, source, options = {}) => {
  const { ..._options } = options
  _options._command = 'update'
  _options._target = [archive, source]
  return createSeven(_options)
}
