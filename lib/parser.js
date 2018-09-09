

/**
 * Extract data from simple line of data. Eg: "
 * T some/file/to/test.txt
 * "
 */
export function matchSymbolFileLine (line) {
  const regex = /(?<symbol>[TUA]) (?<file>.*\s*)/
  const match = line.match(regex)
  if (match) {
    return match.groups
  } else {
    return null
  }
}
