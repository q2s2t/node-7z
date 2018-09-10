
/**
 * Quick wrappper around RegExp named capture groups
 * @param {String} line Line of data
 * @param {String} lineType lineType to be match
 */
export function matchLine (line, lineType) {
  const lineTypes = {
    progress: / *(?<percent>\d+)% (?<fileCount>\d+)$/,
    infoHeaders: /^(?<property>.+) = (?<value>.+)$/,
    infoFooter: /^(?<property>.+): (?<value>.+)$/,
    symbolFile: /^(?<symbol>[TU+]) (?<file>.*\s*)$/
  }
  const match = line.match(lineTypes[lineType])
  if (match) {
    return match.groups
  } else {
    return null
  }
}
