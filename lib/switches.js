import { swDefaultBool, swContextBool, swRepeating, swArgs } from './references.js'

/**
 * Transform an object of options into an array that can be passed to the
 * spawned child process. Only cares about the known switches from 7-zip
 * @param  {Object} options An object of options
 * @return {array} Array to pass to the `run` function.
 */
export function transformSwitchesToArgs (options) {
  const swDefaultBoolKeys = Object.keys(swDefaultBool)
  const swContextBoolKeys = Object.keys(swContextBool)
  const swRepeatingKeys = Object.keys(swRepeating)
  const swArgsKeys = Object.keys(swArgs)
  const switches = Object.assign({}, swDefaultBool, options)

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
