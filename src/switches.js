import { swApiNames, swDefaultBool, swContextBool, swRepeating, swArgs } from './references.js'

// Set deflaut values. This block is out of any function for performances (only
// executed once and code quality concerns (transformSwitchesToArgs to long)
const swApiNamesKeys = Object.keys(swApiNames)
const swDefaultBoolKeys = Object.keys(swDefaultBool)
const swContextBoolKeys = Object.keys(swContextBool)
const swRepeatingKeys = Object.keys(swRepeating)
const swArgsKeys = Object.keys(swArgs)
const swDefaults = {
  y: true,
  bb: 3,
  bs: []
}

// Transform readable switch API to 7zip cryptic switch API
export function transformApiToSwitch (options) {
  Object.keys(options).forEach(function (swApiName) {
    const isApiName = (swApiNamesKeys.includes(swApiName))
    if (isApiName) {
      const swName = swApiNames[swApiName]
      options[swName] = options[swApiName]
    }
  })
  if (options.$progress) {
    let outputStreams = options.bs || options.outputStreams || []
    outputStreams.push('p1')
    options.bs = outputStreams
  }
  return options
}

// Transform an object of options into an array that can be passed to the
// spawned child process. Only cares about the known switches from 7-zip
export function transformSwitchesToArgs (options) {
  const switches = Object.assign({}, swDefaultBool, swDefaults, options)

  // Args accumulator
  let cmdArgs = []

  Object.entries(switches).forEach(function ([swName, swVal]) {
    // Handle boolean switches
    const isDefaultBool = (swDefaultBoolKeys.includes(swName))
    if (isDefaultBool) {
      if (swVal === true) {
        cmdArgs.push(`-${swName}`)
      }
      return
    }

    // Handle context boolean switches
    const isContextBool = (swContextBoolKeys.includes(swName))
    if (isContextBool) {
      let swSuffix = (swVal === true) ? '' : '-'
      cmdArgs.push(`-${swName}${swSuffix}`)
      return
    }

    // Handle repeating switches. They can be string or array
    const isRepeating = (swRepeatingKeys.includes(swName))
    if (isRepeating) {
      swVal.forEach(function (swRepeatingString) {
        cmdArgs.push(`-${swName}${swRepeatingString}`)
      })
      return
    }

    // Handle switches with arguments
    const isArgs = (swArgsKeys.includes(swName))
    if (isArgs) {
      cmdArgs.push(`-${swName}${swVal}`)
    }
  })

  return cmdArgs
}
