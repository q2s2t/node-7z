/**
 * Switches that can be toggled on or off (boolean switches). Default values
 * are based on the 7-zip documentation.
 */
const swDefaultBool = {
  r: false, // Recurse subdirectories. For `-r0` usage see `raw`
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
  ai: undefined, // Include archive filenames
  ax: undefined, // Exclude archive filenames
  i: undefined, // Include filenames
  m: undefined, // Set Compression Method
  x: undefined, // Exclude filenames
  raw: undefined // Special `node-7z` option
}

/**
 * Transform an object of options into an array that can be passed to the
 * spawned child process.
 * @param  {Object} switches An object of options
 * @return {array} Array to pass to the `run` function.
 */
export function toChildProcessArgs (switches) {
  const swDefaultBoolKeys = Object.keys(swDefaultBool)
  const swContextBoolKeys = Object.keys(swContextBool)
  const swRepeatingKeys = Object.keys(swRepeating)
  const swCopy = {...swDefaultBool}
  Object.assign(swCopy, switches)
  let cmdArgs = []

  Object.entries(swCopy).forEach(function ([swName, swVal]) {
    // Handle wildcards
    const isWildcard = (swName === 'wildcards')
    if (isWildcard) {
      cmdArgs = swVal.concat(cmdArgs)
      return
    }

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
      const isString = (typeof swVal === 'string')
      if (isString) {
        swVal = [swVal]
      }
      swVal.forEach(function (swRepeatingString) {
        const swPrefix = (swName === 'raw') ? '' : `-${swName}`
        cmdArgs.push(`${swPrefix}${swRepeatingString}`)
      })
      return
    }

    // Handle switches with arguments
    cmdArgs.push(`-${swName}${swVal}`)
  })

  return cmdArgs
}
