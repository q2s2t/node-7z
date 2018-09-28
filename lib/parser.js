
export function matchProgress (line) {
  const regexp = / *(?<percent>\d+)%( (?<fileCount>\d+))?$/
  const match = line.match(regexp)
  if (match) {
    let progress = {}
    Object.entries(match.groups).forEach(function ([key, val]) {
      progress[key] = Number.parseInt(val, 10)
    })
    return progress
  } else {
    return null
  }
}

export function matchPropsEquals (line) {
  const regexp = /^(?<property>.+) = (?<value>.+)$/
  const match = line.match(regexp)
  if (match) {
    return [match.groups]
  } else {
    return null
  }
}

export function matchSymbolFile (line) {
  const regexp = /^(?<symbol>[TU+]) (?<file>.*\s*)$/
  const match = line.match(regexp)
  if (match) {
    const files = [match.groups]
    return files
  } else {
    return null
  }
}

export function matchPropsColon (line) {
  const regexp = /^(?<property>.+?): (?<value>.+)$/
  const rawProps = line.split(/, +# /)
  const props = rawProps.map(function (raw) {
    const match = raw.match(regexp)
    if (match) {
      const groups = match.groups
      const props = {[groups.property]: groups.value}
      return props
    } else {
      return null
    } 
  }).filter((i) => (i !== null))
  const isInfoInLine = (props.length > 0)
  if (isInfoInLine) {
    return props
  } else {
    return null
  }
}
