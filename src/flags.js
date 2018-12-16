const negate = require('lodash/negate')
const isEmpty = require('lodash/isEmpty')
const defaultsDeep = require('lodash/defaultsDeep')
const { FLAGS, OPTIONS_DEFAULT } = require('./references')

// Build arguments ready to be passed to `childProcess.spawn()` from the
// `options` provided by the module consumer.
const fromOptions = options => {
  let opts = { ...defaultsDeep(options, OPTIONS_DEFAULT) }
  opts = populateOutputStreams(opts)
  opts = populateOutputDir(opts)
  const entries = Object.entries(opts)
  let args = entries
    .map(fromPair)
    .filter(isReferenced)
    .map(populateStore)
    .map(handle)
    .reduce((flags, flag) => flags.concat(flag), [])
    .filter(negate(isEmpty))
  if (opts.$raw) {
    opts.$raw.map(raw => args.push(raw))
  }
  return args
}

const fromPair = pair => {
  const flag = {
    api: pair[0],
    value: pair[1]
  }
  return flag
}

const isReferenced = flag => {
  return !!FLAGS.find(store => store.api === flag.api)
}

const populateStore = flag => {
  const reference = FLAGS.find(store => store.api === flag.api)
  flag.type = reference.type
  flag.cli = reference.cli
  return flag
}

const handle = flag => {
  const handlers = {
    bool: flag => {
      return (flag.value === true) ? `-${flag.cli}` : ''
    },
    boolContext: flag => {
      let suffix = (flag.value === true) ? '' : '-'
      return `-${flag.cli}${suffix}`
    },
    string: flag => {
      return `-${flag.cli}${flag.value}`
    },
    stringArray: flag => {
      const values = flag.value
      return values.reduce((acc, value) => {
        acc.push(`-${flag.cli}${value}`)
        return acc
      }, [])
    }
  }
  return handlers[flag.type](flag)
}

const populateOutputStreams = options => {
  const addProgress = (options.$progress && !options.outputStreams.includes('p1'))
  if (addProgress) {
    options.outputStreams.push('p1')
  }
  return options
}

const populateOutputDir = options => {
  const isFalsy = isEmpty(options.outputDir)
  if (!isFalsy) {
    return options
  } else {
    const { outputDir, ...optionsWithoutOuptutDir } = options
    return optionsWithoutOuptutDir
  }
}

module.exports = { fromOptions }
