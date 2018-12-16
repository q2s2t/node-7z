const LINE_SPLIT = /\n|\r\n|\x08+|\r +\r/
const BODY_PROGRESS = /^ *(?<percent>\d+)% ?(?<fileCount>\d+)? ?(?<file>.*)$/
const BODY_SYMBOL_FILE = /^(?<symbol>[=TU+R.-]) (?<file>.+)$/
const BODY_HASH = /^(?<hash>\S+)? +(?<size>\d*) +(?<file>.+)$/
const END_OF_STAGE_HYPHEN = /^(-+ +)+-+$/
const INFOS = /^(?<property>.+?)(?<separator>( = )|(: +))(?<value>.+)$/
const INFOS_SPLIT = /, +# /
const ERROR = /(?<level>WARNING|ERROR): (?<message>.*)(\r\n)?(\n)?/i

module.exports = {
  LINE_SPLIT,
  BODY_PROGRESS,
  BODY_SYMBOL_FILE,
  BODY_HASH,
  END_OF_STAGE_HYPHEN,
  INFOS,
  INFOS_SPLIT,
  ERROR
}
