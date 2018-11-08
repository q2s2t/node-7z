export const LINE_SPLIT = /\n|\r\n|\x08+|\r +\r/
export const BODY_PROGRESS = /^ *(?<percent>\d+)% ?(?<fileCount>\d+)? ?(?<file>.*)$/
export const BODY_SYMBOL_FILE = /^(?<symbol>[=TU+R.-]) (?<file>.+)$/
export const BODY_HASH = /^(?<hash>\S+)? +(?<size>\d*) +(?<file>.+)$/
export const END_OF_STAGE_HYPHEN = /^(-+ +)+-+$/
export const INFOS = /^(?<property>.+?)(?<separator>( = )|(: +))(?<value>.+)$/
export const INFOS_SPLIT = /, +# /
export const ERR_ONE_LINE = /(?<level>WARNING|ERROR): (?<message>.*)\n(\r\n)?/i
export const ERR_MULTIPLE_LINE = /(?<level>WARNING|ERROR): (?<message>.+)(\n(?<path>.+)\n)?(\r\n)?/i
