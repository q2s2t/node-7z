import { INFOS, BODY_PROGRESS, BODY_SYMBOL_FILE, BODY_HASH, INFOS_SPLIT } from './regexp.js'

export function matchBodyProgress (line) {
  const isLineEmpty = (line.trim().length === 0)
  if (isLineEmpty) {
    return null
  }
  const match = line.match(BODY_PROGRESS)
  if (match) {
    return {
      percent: Number.parseInt(match.groups.percent),
      fileCount: Number.parseInt(match.groups.fileCount)
    }
  }
  return null
}

export function matchBodySymbolFile (line) {
  const match = line.match(BODY_SYMBOL_FILE)
  if (match) {
    return match.groups
  }
  return null
}

export function matchBodyHash (line) {
  const match = line.match(BODY_HASH)
  if (match) {
    return {
      hash: match.groups.hash,
      size: Number.parseInt(match.groups.size),
      file: match.groups.file
    }
  }
  return null
}

export function matchInfos (line) {
  const rawProps = line.split(INFOS_SPLIT)
  const props = rawProps.map(function (raw) {
    const match = raw.match(INFOS)
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
