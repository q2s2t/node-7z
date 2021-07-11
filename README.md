<h1 align="center">node-7z</h1>
<p align="center">A Node.js wrapper for 7-Zip</p>

[![Release][npm-image]][npm-url]
[![Dependencies Status][david-image]][david-url]
[![Linux Build][circleci-image]][circleci-url]
[![Windows Build][appveyor-image]][appveyor-url]
[![Code coverage][coverage-image]][coverage-url]
[![Code Maintainability][maintainability-image]][maintainability-url]
[![Known Vulnerabilities][vulnerabilities-image]][vulnerabilities-url]

## Usage

```js
import Seven from 'node-7z'

// myStream is a Readable stream
const myStream = Seven.extractFull('./archive.7z', './output/dir/', {
  $progress: true
})

myStream.on('data', function (data) {
  doStuffWith(data) //? { status: 'extracted', file: 'extracted/file.txt" }
})

myStream.on('progress', function (progress) {
  doStuffWith(progress) //? { percent: 67, fileCount: 5, file: undefinded }
})

myStream.on('end', function () {
    // end of the operation, get the number of folders involved in the operation
  myStream.info.get('Folders') //? '4'
})

myStream.on('error', (err) => handleError(err))

```

## Table of content

 * [Usage](#usage)
 * [Installation](#installation)
 * [API](#api)
   * [Commands](#commands)
   * [Options](#options)
   * [Events](#events)
 * [Advanced usage](#advanced-usage)


## Installation

```sh
npm install --save node-7z
```

You should have the a 7-Zip executable (v16.02 or greater) available in your system.

> - On Debian and Ubuntu install the p7zip-full package or use 7-Zip 21.02 alpha or higher
> - On Mac OSX use Homebrew `brew install p7zip`
> - On Windows get 7-Zip from [7-Zip download page](https://www.7-zip.org/download.html).
>
> By default the module calls the `7z` binary, it should be available in your
> PATH.

An alternative is to add the `7zip-bin` module to your project. This module
contains an up-to-date version of 7-Zip for all available plaforms. Then you
can do:

```js
import sevenBin from '7zip-bin'
import { extractFull } from 'node-7z'

const pathTo7zip = sevenBin.path7za
const seven = extractFull('./archive.7z', './output/dir/', {
  $bin: pathTo7zip
})
```

## API

> See the [7-Zip documentation](http://sevenzip.sourceforge.jp/chm/cmdline/index.htm)
> for the full list of usages and options (switches).

### Commands

#### Add
Adds files to an archive.

| Arguments | Type               | Description |
|-----------|--------------------|-------------|
| archive   | `string`           | Archive to create |
| source    | `string\|string[]` | Source files to add to the archive. Multiple sources can be given using an `Array` |
| [options] | `Object`           | [Options object](#options). Can be omitted  |

```js
// adds all *.txt files from current folder and its subfolders to archive Files.7z.
const myStream = Seven.add('Files.7z', '*.txt', {
  recursive: true
})
```

#### Delete
Deletes files from an archive.

| Arguments | Type               | Description |
|-----------|--------------------|-------------|
| archive   | `string`           | Archive to target |
| target    | `string\|string[]` | Target files to remove from the archive. Multiple targets can be given using an `Array` |
| [options] | `Object`           | [Options object](#options). Can be omitted  |

```js
// deletes *.bak files from archive archive.zip.
const myStream = Seven.delete('archive.zip', '*.bak')
```

#### Extract
Extracts files from an archive to the current directory or to the output directory. This command copies all extracted files to one directory.

| Arguments | Type              | Description |
|-----------|-------------------|-------------|
| archive   | `string` | Archive to extract files from |
| output    | `string` | Output directory |
| [options] | `Object` | [Options object](#options). Can be omitted  |

```js
// extracts all *.cpp files from archive archive.zip to c:\soft folder.
const myStream = Seven.extract('archive.zip', 'c:/soft', {
  recursive: true,
  $cherryPick: '*.cpp'
})
```

#### Extract with full paths
Extracts files from an archive with their full paths in the current directory, or in an output directory if specified.

| Arguments | Type              | Description |
|-----------|-------------------|-------------|
| archive   | `string` | Archive to extract files from |
| output    | `string` | Output directory |
| [options] | `Object` | [Options object](#options). Can be omitted  |

```js
// extracts all *.cpp files from the archive archive.zip to c:\soft folder.
const myStream = Seven.extractFull('archive.zip', 'c:/soft', {
  recursive: true,
  $cherryPick: '*.cpp'
})
```

#### Hash
Calculates hash values for files.

| Arguments | Type               | Description |
|-----------|--------------------|-------------|
| target    | `string\|string[]` | Target files to calculate the hash of. Multiple targets can be given using an `Array` |
| [options] | `Object`           | [Options object](#options). Can be omitted  |

```js
// calculates SHA256 for a.iso.
const myStream = Seven.hash('a.iso', {
  hashMethod: 'sha256'
})
```

#### List
Lists contents of an archive.

| Arguments | Type              | Description |
|-----------|-------------------|-------------|
| archive   | `string` | Archive to list the file from |
| [options] | `Object`  | [Options object](#options). Can be omitted  |

```js
// list all the *.txt and *.js files in archive.zip
const myStream = Seven.list('archive.zip', {
  $cherryPick: ['*.txt*', '*.js'],
})
```

#### Rename
Renames files in an archive.

| Arguments | Type              | Description |
|-----------|-------------------|-------------|
| archive   | `string`          | Archive to target |
| target    | `Array[string[]]` | Pair of target/new names files to remove rename. Multiple targets can be given using an `Array` |
| [options] | `Object`          | [Options object](#options). Can be omitted  |

```js
// renames old.txt to new.txt and 2.txt to folder\2new.txt .
const myStream = Seven.rename('a.7z', [
  ['old.txt', 'new.txt'],
  ['2.txt', 'folder/2new.txt']
])
```

#### Test integrity
Tests archive files.

| Arguments | Type              | Description |
|-----------|-------------------|-------------|
| archive   | `string` | Archive to test |
| [options] | `Object`  | [Options object](#options). Can be omitted  |

```js
// tests *.doc files in archive archive.zip.
const myStream = Seven.list('archive.zip', {
  recursive: true,
  $cherryPick: '*.doc'
})
```

#### Update
Updates older files in the archive and adds files that are not already in the archive.

| Arguments | Type              | Description |
|-----------|-------------------|-------------|
| archive   | `string`          | Archive to create |
| source    | `string\|string[]` | Source files to update from the file-system to the archive. Multiple sources can be given using an `Array` |
| [options] | `Object`          | [Options object](#options). Can be omitted  |

```js
// updates *.doc files to archive archive.zip.
const myStream = Seven.add('archive.zip', '*.doc')
```

### Options

#### Switches

In the 7-Zip world, command flags are called switches. In order to use them you can pass their name and value in the [Options object](#options)

| Name                     | Type       | Description                                                           | Switches |
|--------------------------|------------|-----------------------------------------------------------------------|----------|
| `alternateStreamExtract` | `boolean`  | "Extract file as alternate stream, if there is ':' character in name" | `-snc`   |
| `alternateStreamReplace` | `boolean`  | Replace ':' character to '_' character in paths of alternate streams  | `-snr`   |
| `deleteFilesAfter`       | `boolean`  | Delete files after compression                                        | `-sdel`  |
| `fullyQualifiedPaths`    | `boolean`  | Usefully qualified file paths                                         | `-spf`   |
| `hardlinks`              | `boolean`  | Store hard links as links (WIM and TAR formats only)                  | `-snh`   |
| `largePages`             | `boolean`  | Set Large Pages mode                                                  | `-spl`   |
| `latestTimeStamp`        | `boolean`  | Set archive timestamp from the most recently modified file            | `-stl`   |
| `noArchiveOnFail`        | `boolean`  | Stop archive creating, if 7-Zip can't open some input file.           | `-sse`   |
| `noRootDuplication`      | `boolean`  | Eliminate duplication of root folder for extract command              | `-spe`   |
| `noWildcards`            | `boolean`  | Disable wildcard matching for file names                              | `-spd`   |
| `ntSecurity`             | `boolean`  | Store NT security                                                     | `-sni`   |
| `sortByType`             | `boolean`  | Sort files by type while adding to solid 7z archive                   | `-mqs`   |
| `openFiles`              | `boolean`  | Compress files open for writing                                       | `-ssw`   |
| `recursive`              | `boolean`  | Recurse subdirectories. For `-r0` usage see `raw`                     | `-r`     |
| `symlinks`               | `boolean`  | Store symbolic links as links (WIM and TAR formats only)              | `-snl`   |
| `techInfo`               | `boolean`  | Show technical information                                            | `-slt`   |
| `timeStats`              | `boolean`  | Show execution time statistics                                        | `-bt`    |
| `toStdout`               | `boolean`  | Write data to stdout                                                  | `-so`    |
| `yes`                    | `boolean`  | Assume Yes on all queries                                             | `-y`     |
| `alternateStreamStore`   | `boolean`  | Store NTFS alternate Streams                                          | `-sns`   |
| `caseSensitive`          | `boolean`  | Set Sensitive Case mode                                               | `-ssc`   |
| `archiveNameMode`        | `string`   | Set Archive name mode                                                 | `-sa`    |
| `archiveType`            | `string`   | Type of archive                                                       | `-t`     |
| `cpuAffinity`            | `string`   | Set CPU thread affinity mask (hexadecimal number).                    | `-stm`   |
| `excludeArchiveType`     | `string`   | Exclude archive type                                                  | `-stx`   |
| `fromStdin`              | `string`   | Read data from StdIn                                                  | `-si`    |
| `hashMethod`             | `string`   | Set hash function                                                     | `-scrc`  |
| `listFileCharset`        | `string`   | Set charset for list files                                            | `-scs`   |
| `logLevel`               | `string`   | Set output log level                                                  | `-bb`    |
| `multiBlockSize`         | `string`   | Creates multi-block xz archives of `[Size]m\|g` block size            | `-ms`    |
| `outputDir`              | `string`   | Set Output directory                                                  | `-o`     |
| `overwrite`              | `string`   | Overwrite mode                                                        | `-ao`    |
| `password`               | `string`   | Set Password                                                          | `-p`     |
| `sfx`                    | `string`   | Create SFX archive                                                    | `-sfx`   |
| `updateOptions`          | `string`   | Update options                                                        | `-u`     |
| `workingDir`             | `string`   | Set Working directory                                                 | `-w`     |
| `excludeArchive`         | `string[]` | Exclude archive filenames                                             | `-ax`    |
| `exclude`                | `string[]` | Exclude filenames                                                     | `-x`     |
| `include`                | `string[]` | Include filenames                                                     | `-i`     |
| `includeArchive`         | `string[]` | Include archive filenames                                             | `-ai`    |
| `method`                 | `string[]` | Set Compression Method                                                | `-m`     |
| `outputStreams`          | `string[]` | Set output stream for output/error/progress                           | `-bs`    |
| `volumes`                | `string[]` | Create Volumes                                                        | `-v`     |

#### Special options

Those options are not provided by 7-Zip but are features of this module.

| Name            | Type                                                                                         | Description                                                              |
|-----------------|----------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|
| `$progress`     | `boolean`                                                                                    | Progress percentage gets fired. Shortcut for `{ outputStreams: ['b1'] }` Use if you want access to the `progress` event. Has an impact on performances. |
| `$defer`        | `boolean`                                                                                    | Create the stream but do not spawn child process                         |
| `$childProcess` | [`ChildProcess`](https://nodejs.org/api/child_process.html#child_process_class_childprocess) | Attach an external child process to be parsed                            |
| `$bin`          | `string`                                                                                     | Path to an other 7-Zip binary. Default: `7z`                             |
| `$cherryPick`   | `string[]`                                                                                   | Some commands accepts more specific targets, see example above           |
| `$raw`          | `string[]`                                                                                   | Pass raw arguments to the `child_process.spawn()`command                 |
| `$spawnOptions` | [`Object`](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) | Pass `options` to the `child_process.spawn()`command     |

### Events

#### Event: `data`

The `data` event is emitted for each processed file. The payload is an object. WARNING only the `data.file` proprety is guaranteed to be present

```js
mySevenStream.on('data', function (data) {
  console.log(data)
  // {
  //   file: 'path/of/the/file/in/the/archive',
  //   status: 'renamed|tested|updated|skipped|deleted|extracted',
  //   attributes: '....A', size: 9, sizeCompressed: 3, (only list command)
  //   hash: 'FEDC304F', size: 9 (only hash command)
  //   techInfo: Map(8) { (only list command with `techInfo` switch)
  //      'Path' => 'DirHex/sub2/e825776890f2b',
  //      'Size' => '9',
  //      'Modified' => '2018-09-29 09:06:15',
  //      'Attributes' => 'A_ -rw-r--r--',
  //      'CRC' => 'FEDC304F',
  //      'Encrypted' => '-',
  //      'Method' => 'LZMA2:12',
  //      'Block' => '0'
  //   }
  // }
})
```

#### Event: `end`

An `.info` proprety can contain meta-data (type [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map))

```js
myStream.info
// Map {
//   '7-Zip [64] 16.02 ' => 'Copyright (c) 1999-2016 Igor Pavlov : 2016-05-21',
//   'Creating archive' => './test/_tmp/txt-and-md-only.7z',
//   'Items to compress' => '6',
//   'Files read from disk' => '6',
//   'Archive size' => '212 bytes (1 KiB)' }
```

#### Event: `error`

```js
mySevenStream.on('error', function (err) {
  // a standard error
  // `err.stderr` is a string that can contain extra info about the error
})
```

## Advanced usage

### Compression method

Using the CLI, compression is done like this:

```sh
# adds *.exe and *.dll files to solid archive archive.7z using LZMA method
# with 2 MB dictionary and BCJ filter.
7z a archive.7z *.exe -m0=BCJ -m1=LZMA:d=21
```

Using this module:

```js
const compress = Seven.add('archive.7z', '*.exe', {
  method: ['0=BCJ', '1=LZMA:d=21']
})
```

### Raw inputs

> Thanks to sketchpunk #9 for this one

Sometimes you just want to use the lib as the original command line. For
instance you want to apply to switches with different values. You  can use the
 custom `$raw` key in your `options` object and pass it an *Array* of
values.

```js
const compress = Seven.add('archive.7z', '*.gif', {
  $raw: [ '-i!*.jpg', '-i!*.png' ], // only images
})
```

### Emoji and Unicode

Due to a `7z` limitation emojis and special characters can't be used as values
when passed to an `option` object (ex: password). But they can be used in
archive, filenames and destinations.

Use the `{ charset: 'UTF-8' }` for special characters.

### Log level

The default log level (`-bb` switch) is set to:

> 3 :show information about additional operations (Analyze, Replicate) for "Add" / "Update" operations.

It's a base feature of `node-7z` and is required for the module to work as
expected. A diffrent value should not be used.

### Security

Values given by the package are not sanitized, you just get the raw output from
the 7-Zip binary. Remember to never trust user input and sanitize accordingly.

### External child process

You can pipe a child procress from an other source and pass it to `node-7z`. An
use case may be that the 7-Zip process runs on an other machine and the sdtio is
piped in the application.

```js
const external = // an external child process
const myStream = Seven.add('dummy', 'dummy', {
  $defer: true
})
myStream.on('data', data => yourLogicWith(data))
Seven.listen(myStream)
```

***
With :heart: from [quentinrossetti](http://quentinrossetti.me/)

[david-url]: https://david-dm.org/quentinrossetti/node-7z
[david-image]: http://img.shields.io/david/quentinrossetti/node-7z.svg
[circleci-url]: https://circleci.com/gh/quentinrossetti/workflows/node-7z
[circleci-image]: https://img.shields.io/circleci/project/github/quentinrossetti/node-7z.svg?logo=linux
[appveyor-url]: https://ci.appveyor.com/project/quentinrossetti/node-7z
[appveyor-image]: https://img.shields.io/appveyor/ci/quentinrossetti/node-7z.svg?logo=windows
[npm-url]: https://www.npmjs.org/package/node-7z
[npm-image]: http://img.shields.io/npm/v/node-7z.svg
[coverage-url]: https://codeclimate.com/github/quentinrossetti/node-7z
[coverage-image]: https://img.shields.io/codeclimate/coverage/quentinrossetti/node-7z.svg
[maintainability-url]: https://codeclimate.com/github/quentinrossetti/node-7z
[maintainability-image]: https://img.shields.io/codeclimate/maintainability/quentinrossetti/node-7z.svg
[vulnerabilities-image]: https://snyk.io/test/github/quentinrossetti/node-7z/badge.svg?targetFile=package.json
[vulnerabilities-url]: https://snyk.io/test/github/quentinrossetti/node-7z?targetFile=package.json
