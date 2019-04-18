// @COMPAT Named capture groups aren't available before Node.js 10.
// Support until Jan 2020 (https://github.com/nodejs/Release)
const RegExp = (() => {
  try {
    new RegExp('(?<test>a)')
    return RegExp
  } catch (error) {
    return require('named-regexp-groups')
  }
})()

const LINE_SPLIT = new RegExp('\n|\r\n|\x08+|\r +\r')
const BODY_PROGRESS = new RegExp('^ *(?<percent>\\d+)% ?(?<fileCount>\\d+)? ?(?<file>.*)$')
const BODY_SYMBOL_FILE = new RegExp('^(?<symbol>[=TU+R.-]) (?<file>.+)$')
const BODY_HASH = new RegExp('^(?<hash>\\S+)? +(?<size>\\d*) +(?<file>.+)$')
const END_OF_STAGE_HYPHEN = new RegExp('^(-+ +)+-+$')
const INFOS = new RegExp('^(?<property>.+?)(?<separator>( = )|(: +))(?<value>.+)$')
const INFOS_SPLIT = new RegExp(', +# ')
const ERROR = new RegExp('(?<level>WARNING|ERROR): (?<message>.*)(\r\n)?(\n)?', 'i')

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
