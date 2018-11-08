
export function transformSpecialArrayToArgs (options, specialName) {
  const isArray = (Array.isArray(options[specialName]))
  if (isArray) {
    return options[specialName]
  } else {
    return []
  }
}

export function transformBinToString (options) {
  const isCustomBin = (options.$bin !== undefined)
  if (isCustomBin) {
    return options.$bin
  } else {
    return '7z'
  }
}
