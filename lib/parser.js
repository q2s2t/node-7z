
export function matchProgress (line) {
  const isLineEmpty = (line.trim().length === 0)
  if (isLineEmpty) {
    return
  }
  const regexp = /^ *((?<percent>\d+)%( (?<fileCount>\d+))?\x08* *\x08* *)*((?<symbol>[TU+R.-]) (?<file>.*))?$/
  const match = line.match(regexp)
  if (match) {
    const parsed = {
      percent: parseInt(match.groups.percent),
      fileCount: parseInt(match.groups.fileCount),
      symbol: match.groups.symbol,
      file: match.groups.file,
    }
    return parsed
  }
  return
}

export function matchProps (line) {
  const regexp = /^(?<property>.+?)(?<separator>( = )|(: ))(?<value>.+)$/
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
