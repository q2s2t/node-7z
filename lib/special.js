
/**
 * Transform an object of options into an array that can be passed to the
 * spawned child process. Only cares about the special $wildcards
 * @param {Object} options An object of options
 * @return {array} Array to pass to the `run` function.
 */
export function transformWildCardsToArgs (options) {
  const isArray = (Array.isArray(options.$wildcards))
  if (isArray) {
    return options.$wildcards
  } else {
    return []
  }
}

/**
 * Transform an object of options into an array that can be passed to the
 * spawned child process. Only cares about the special $raw
 * @param {Object} options An object of options
 * @return {array} Array to pass to the `run` function.
 */
export function transformRawToArgs (options) {
  const isArray = (Array.isArray(options.$raw))
  if (isArray) {
    return options.$raw
  } else {
    return []
  }
}

/**
 * Return the command to run
 * @param {options} options
 */
export function transformPathToString (options) {
  const isCustomPath = (options.$path !== undefined)
  if (isCustomPath) {
    return options.$path
  } else {
    return '7za'
  }
}
