// Copyright (c) 2014-2019, Quentin Rossetti <quentin.rossetti@gmail.com>

// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.

// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

const LINE_SPLIT = new RegExp('\n|\r\n|\x08+|\r +\r')
const BODY_PROGRESS = new RegExp('^ *(?<percent>\\d+)% ?(?<fileCount>\\d+)? ?(?<file>.*)$')
const BODY_SYMBOL_FILE = new RegExp('^(?<symbol>[=TU+R.-]) (?<file>.+)$')
const BODY_HASH = new RegExp('^(?<hash>\\S+)? +(?<size>\\d*) +(?<file>.+)$')
const END_OF_STAGE_HYPHEN = new RegExp('^(-+ +)+-+$')
const END_OF_TECH_INFOS_HEADERS = new RegExp('^----------$')
const INFOS = new RegExp('^(?<property>.+?)(?<separator>( = )|(: +))(?<value>.+)$')
const INFOS_PATH = new RegExp('^Path = (?<path>.+)$')
const INFOS_SPLIT = new RegExp(', +# ')
const ERROR = new RegExp('(?<level>WARNING|ERROR): (?<message>.*)(\r\n)?(\n)?', 'i')

module.exports = {
  LINE_SPLIT,
  BODY_PROGRESS,
  BODY_SYMBOL_FILE,
  BODY_HASH,
  END_OF_STAGE_HYPHEN,
  END_OF_TECH_INFOS_HEADERS,
  INFOS,
  INFOS_PATH,
  INFOS_SPLIT,
  ERROR
}
