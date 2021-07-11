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

const FLAGS = [
  { type: 'bool', api: 'alternateStreamExtract', cli: 'snc' }, // Extract file as alternate stream, if there is ':' character in name
  { type: 'bool', api: 'alternateStreamReplace', cli: 'snr' }, // Replace ':' character to '_' character in paths of alternate streams
  { type: 'bool', api: 'deleteFilesAfter', cli: 'sdel' }, // Delete files after compression
  { type: 'bool', api: 'fullyQualifiedPaths', cli: 'spf' }, // Use fully qualified file paths
  { type: 'bool', api: 'hardlinks', cli: 'snh' }, // Store hard links as links (WIM and TAR formats only)
  { type: 'bool', api: 'largePages', cli: 'spl' }, // Set Large Pages mode
  { type: 'bool', api: 'latestTimeStamp', cli: 'stl' }, // Set archive timestamp from the most recently modified file
  { type: 'bool', api: 'noArchiveOnFail', cli: 'sse' }, // Stop archive creating, if 7-Zip can't open some input file.
  { type: 'bool', api: 'noRootDuplication', cli: 'spe' }, // Eliminate duplication of root folder for extract command
  { type: 'bool', api: 'noWildcards', cli: 'spd' }, // Disable wildcard matching for file names
  { type: 'bool', api: 'ntSecurity', cli: 'sni' }, // Store NT security
  { type: 'bool', api: 'openFiles', cli: 'ssw' }, // Compress files open for writing
  { type: 'bool', api: 'recursive', cli: 'r' }, // Recurse subdirectories. For `-r0` usage see `raw`
  { type: 'bool', api: 'symlinks', cli: 'snl' }, // Store symbolic links as links (WIM and TAR formats only)
  { type: 'bool', api: 'techInfo', cli: 'slt' }, // Show technical information
  { type: 'bool', api: 'timeStats', cli: 'bt' },
  { type: 'bool', api: 'toStdout', cli: 'so' }, // Write data to stdout
  { type: 'bool', api: 'yes', cli: 'y' }, // Assume Yes on all queries
  { type: 'bool', api: 'sortByType', cli: 'mqs' }, // Sort files by type while adding to solid 7z archive
  { type: 'boolContext', api: 'alternateStreamStore', cli: 'sns' }, // Store NTFS alternate Streams
  { type: 'boolContext', api: 'caseSensitive', cli: 'ssc' }, // Set Sensitive Case mode
  { type: 'string', api: 'archiveNameMode', cli: 'sa' }, // Set Archive name mode
  { type: 'string', api: 'archiveType', cli: 't' }, // Type of archive
  { type: 'string', api: 'cpuAffinity', cli: 'stm' }, // Set CPU thread affinity mask (hexadecimal number).
  { type: 'string', api: 'excludeArchiveType', cli: 'stx' }, // Exclude archive type
  { type: 'string', api: 'fromStdin', cli: 'si' }, // Read data from StdIn
  { type: 'string', api: 'hashMethod', cli: 'scrc' }, // Set hash function
  { type: 'string', api: 'listFileCharset', cli: 'scs' }, // Set charset for list files
  { type: 'string', api: 'charset', cli: 'scc' }, // Set charset for console input/output
  { type: 'string', api: 'logLevel', cli: 'bb' }, // Set output log level
  { type: 'string', api: 'outputDir', cli: 'o' }, // Set Output directory
  { type: 'string', api: 'overwrite', cli: 'ao' }, // Overwrite mode
  { type: 'string', api: 'password', cli: 'p' }, // Set Password
  { type: 'string', api: 'sfx', cli: 'sfx' }, // Create SFX archive
  { type: 'string', api: 'updateOptions', cli: 'u' }, // Update options
  { type: 'string', api: 'workingDir', cli: 'w' }, // Set Working directory
  { type: 'string', api: 'multiBlockSize', cli: 'ms' }, // Creates multi-block xz archives by default. Block size can be specified with -ms[Size]{m|g} switch
  { type: 'stringArray', api: 'excludeArchive', cli: 'ax' }, // Exclude archive filenames
  { type: 'stringArray', api: 'exclude', cli: 'x' }, // Exclude filenames
  { type: 'stringArray', api: 'include', cli: 'i' }, // Include filenames
  { type: 'stringArray', api: 'includeArchive', cli: 'ai' }, // Include archive filenames
  { type: 'stringArray', api: 'method', cli: 'm' }, // Set Compression Method
  { type: 'stringArray', api: 'outputStreams', cli: 'bs' }, // Set output stream for output/error/progress
  { type: 'stringArray', api: 'volumes', cli: 'v' } // Create Volumes
  // Advanced
]

const OPTIONS_DEFAULT = {
  yes: true,
  logLevel: '3',
  outputStreams: []
}

const BIN_DEFAULT = '7z'

const STAGE_HEADERS = Symbol('STAGE_HEADERS')
const STAGE_BODY = Symbol('STAGE_BODY')
const STAGE_FOOTERS = Symbol('STAGE_FOOTERS')

const COMMAND_LETTERS = {
  add: 'a',
  delete: 'd',
  extract: 'e',
  extractFull: 'x',
  hash: 'h',
  list: 'l',
  listTechInfo: 'l',
  rename: 'rn',
  test: 't',
  update: 'u'
}

/* eslint-disable */
// =TU+R.-
const SYMBOL_OPERATIONS = {
  '=': 'renamed',
  'T': 'tested',
  'U': 'updated',
  'R': 'skipped',
  '.': 'deleted',
  '-': 'extracted'
}
/* eslint-enable */

module.exports = {
  FLAGS,
  OPTIONS_DEFAULT,
  BIN_DEFAULT,
  STAGE_HEADERS,
  STAGE_BODY,
  STAGE_FOOTERS,
  COMMAND_LETTERS,
  SYMBOL_OPERATIONS
}
