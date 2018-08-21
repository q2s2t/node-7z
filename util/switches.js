/**
 * Switches that can be toggled on or off (boolean switches). Default values
 * are based on the 7-zip documentation.
 */
const swDefaultBool = {
  sdel: false, // Delete files after compression
  spl: false, // Set Large Pages mode
  sni: false, // Store NT security information
  so: false, // Write data to stdout
  spd: false, // Disable wildcard matching for file names
  spe: false, // Eliminate duplication of root folder for extract command
  spf: false, // Use fully qualified file paths
  ssw: false, // Compress files open for writing
  stl: false, // Set archive timestamp from the most recently modified file
  y: true // Assume Yes on all queries
}

/**
 * Switches that ca be toggles on or of. Their default values changes according
 * to the context (command, platform, ...).
 */
const swContextBool = {
  sns: undefined, // Store NTFS alternate Streams
  ssc: undefined // Set Sensitive Case mode
}

/**
 * Switches that can be applied multiple times
 */
const swRepeating = {
  ai: undefined,
  ax: undefined,
  i: undefined,
  x: undefined
}

/**
 * Transform an object of options into an array that can be passed to the
 * spawned child process.
 * @param  {Object} switches An object of options
 * @return {array} Array to pass to the `run` function.
 */
export default function toChildProcessArgs (switches = swDefaultBool) {
  const swDefaultBoolKeys = Object.keys(swDefaultBool)
  const swContextBoolKeys = Object.keys(swContextBool)
  const swRepeatingKeys = Object.keys(swRepeating)
  let cmdArgs = []

  Object.entries(switches).forEach(([swName, swVal]) => {
    // Handle wildcards
    if (swName === 'wildcards') {
      cmdArgs.unshift(swVal)
      return
    }

    // Handle boolean switches
    if (swDefaultBoolKeys.includes(swName)) {
      if (swVal === true) {
        cmdArgs.push(`-${swName}`)
      }
      return
    }

    // Handle context boolean switches
    if (swContextBoolKeys.includes(swName)) {
      let swSuffix = (swVal === true) ? '' : '-'
      cmdArgs.push(`-${swName}${swSuffix}`)
      return
    }

    // Handle repeating switches. They can be string or array
    if (swRepeatingKeys.includes(swName)) {
      if (typeof swVal === 'string') {
        swVal = [swVal]
      }
      swVal.forEach(([swRepeatingString]) => {
        cmdArgs.push(`-${swName}${swRepeatingString}`)
      })
      return
    }

    // Handle switches with arguments
    cmdArgs.push(`-${swName}${swVal}`)
  })

  return cmdArgs
}
