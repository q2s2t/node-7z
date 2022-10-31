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

export const BODY_PROGRESS = new RegExp('^ *(?<percent>\\d+)% ?(?<fileCount>\\d+)? ?(?<file>.*)$')
export const BODY_SYMBOL_FILE = new RegExp('^(?<symbol>[=TU+R.-]) (?<file>.+)$')
export const BODY_HASH = new RegExp('^(?<hash>\\S+)? +(?<size>\\d*) +(?<file>.+)$')
export const END_OF_STAGE_HYPHEN = new RegExp('^(-+ +)+-+$')
export const END_OF_TECH_INFOS_HEADERS = new RegExp('^----------$')
export const INFOS = new RegExp('^(?<property>.+?)(?<separator>( = )|(: +))(?<value>.+)$')
export const INFOS_PATH = new RegExp('^Path = (?<path>.+)$')
export const INFOS_SPLIT = new RegExp(', +# ')
export const ERROR = new RegExp('(?<level>WARNING|ERROR): (?<message>.*)(\r\n)?(\n)?', 'i')
