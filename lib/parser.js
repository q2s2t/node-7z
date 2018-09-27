
export function matchProgress (line) {
  const regexp = / *(?<percent>\d+)%( (?<fileCount>\d+)$/
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

export function matchPropsColonDuo (line) {
  const regexp = /^(?<property1>.+): (?<value1>.+),  # (?<property2>.+): (?<value2>.+)/
  const match = line.match(regexp)
  if (match) {
    let match1 = {}
    match1[match.groups.property1] = match.groups.value1
    let match2 = {}
    match2[match.groups.property2] = match.groups.value2
    const props = [match1, match2]
    return props
  } else {
    return null
  }
}

export function matchPropsColon (line) {
  const regexp = /^(?<property>.+): (?<value>.+)$/
  const match = line.match(regexp)
  if (match) {
    let match1 = {}
    match1[match.groups.property1] = match.groups.value1
    const props = [match1]
    return props
  } else {
    return null
  }
}
