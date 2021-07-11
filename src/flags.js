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

const negate = require('lodash.negate')
const isEmpty = require('lodash.isempty')
const defaultsDeep = require('lodash.defaultsdeep')
const { FLAGS, OPTIONS_DEFAULT } = require('./references')

// Build arguments ready to be passed to `childProcess.spawn()` from the
// `options` provided by the module consumer.
const fromOptions = options => {
  let opts = { ...defaultsDeep(options, OPTIONS_DEFAULT) }
  opts = populateOutputStreams(opts)
  opts = populateOutputDir(opts)
  const entries = Object.entries(opts)
  const args = entries
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
      const suffix = (flag.value === true) ? '' : '-'
      return `-${flag.cli}${suffix}`
    },
    string: flag => {
      if (flag.value) {
        return `-${flag.cli}${flag.value}`
      } else {
        return ''
      }
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
