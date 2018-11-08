node-7z
=======

[![Release][npm-image]][npm-url]
[![Dependencies Status][david-image]][david-url]
[![Linux Build][circleci-image]][circleci-url]
[![Windows Build][appveyor-image]][appveyor-url]
[![Code coverage][coverage-image]][coverage-url]
[![Code Maintainability][maintainability-image]][maintainability-url]

> A Node.js wrapper for 7-Zip

Usage
-----

Stream API:

```js
import extractFull from 'node-7z'

const seven = extractFull('./archive.7z', './output/dir/')
  .on('data', function (data) {
    doStuffWith(data) //? { symbol: '-', file: 'extracted/file.txt" }
  })
  .on('progresss', function (progress) {
    doStuffWith(progress) //? { percent: 67, fileCount: 5, file: undefinded }
  })
  .on('end', function () {
    // end of the operation, get the number of folders involved in the operation
    seven.info.get('Folders') //? 4
  })
  .on('error', (err) => handleError(err))

```

Installation
------------

```sh
npm install --save node-7z
```

You must have the a 7-Zip executable (v16.04 or greater) available in your
system.

> - On Debian and Ubuntu install the p7zip-full package.
> - On Mac OSX use Homebrew `brew install p7zip`
> - On Windows get 7-Zip frome [7-Zip download page](https://www.7-zip.org/download.html).
>
> By default the module calls the `7z` binary, it should be available in your
> PATH.

An alernative is to add the `7zip-bin` module to your project. This module
contains an up-to-date version of 7-Zip for all available plaforms. Then you
can do:

```js
import sevenBin from '7zip-bin'
import extractFull from 'node-7z'

const pathTo7zip = sevenBin.path7za
const seven = extractFull('./archive.7z', './output/dir/', {
  $bin: pathTo7zip
})
```

API
---

> See the [7-Zip documentation](http://sevenzip.sourceforge.jp/chm/cmdline/index.htm)
> for the full list of usages and options (switches).

> The type of the list of files can be either *String* or *Array*.

### Add: `Zip.add`

**Arguments**
 * `archive` Path to the archive you want to create.
 * `files` The file list to add.
 * `options` An object of options (7-Zip switches).

**Progress**
 * `files` A array of all the added files. The `/`
   character is used as a path separator on every platform.

**Error**
 * `err` An Error object.


### Delete: `Zip.delete`

**Arguments**
 * `archive` Path to the archive you want to delete files from.
 * `files` The file list to delete.
 * `options` An object of options (7-Zip switches).

**Error**
 * `err` An Error object.


### Extract: `Zip.extract`

**Arguments**
 * `archive` The path to the archive you want to extract.
 * `dest` Where to extract the archive.
 * `options` An object of options.

**Progress**
 * `files` A array of all the extracted files *AND* directories. The `/`
   character is used as a path separator on every platform.

**Error**
 * `err` An Error object.


### Extract with full paths: `Zip.extractFull`

**Arguments**
 * `archive` The path to the archive you want to extract.
 * `dest` Where to extract the archive (creates folders for you).
 * `options` An object of options.

**Progress**
 * `files` A array of all the extracted files *AND* directories. The `/`
   character is used as a path separator on every platform.

**Error**
 * `err` An Error object.


### List contents of archive: `Zip.list`

**Arguments**
 * `archive` The path to the archive you want to analyse.
 * `options` An object of options.

**Progress**
 * `files` A array of objects of all the extracted files *AND* directories.
   The `/` character is used as a path separator on every platform. Object's
   properties are: `date`, `attr`, `size` and `name`.

**Fulfill**
 * `spec` An object of tech spec about the archive. Properties are: `path`,
   `type`, `method`, `physicalSize` and `headersSize` (Some of them may be
   missing with non-7z archives).

**Error**
 * `err` An Error object.


### Test integrity of archive: `Zip.test`

**Arguments**
 * `archive` The path to the archive you want to analyse.
 * `options` An object of options.

**Progress**
 * `files` A array of all the tested files. The `/`
   character is used as a path separator on every platform.

**Error**
 * `err` An Error object.


### Update: `Zip.update`

**Arguments**
 * `archive` Path to the archive you want to update.
 * `files` The file list to update.
 * `options` An object of options (7-Zip switches).

**Progress**
 * `files` A array of all the updated files. The `/`
   character is used as a path separator on every platform.

**Error**
 * `err` An Error object.

Advanced usage
--------------

### Compression method

Using the CLI, compression is made like that:

```sh
# adds *.exe and *.dll files to solid archive archive.7z using LZMA method
# with 2 MB dictionary and BCJ filter.
7z a archive.7z *.exe -m0=BCJ -m1=LZMA:d=21
```

With to module you can translate it like that:

```js
import { add } from 'node-7z'
const myCompressStream = new add('archive.7z', '*.exe', {
  m: ['0=BCJ', '=LZMA:d=21']
})
```

### Add, delete and update multiple files

When adding, deleting or updating archives you can pass either a string or an
array as second parameter (the `files` parameter).

```js
import { remove } from 'node-7z'
const myDeleteStream = new remove('bigArchive.7z', [ 'file1', 'subdir/*.js' ])
```

### Raw inputs

> Thanks to sketchpunk #9 for this one

Sometimes you just want to use the lib as the original command line. For
instance you want to apply to switches with different values. You  can use the
 custom `$raw` key in your `options` object and pass it an *Array* of
values.

```js
import { add } from 'node-7z'
const myCompressStream = new add('archive.7z', {
  $raw: [ '-i!*.jpg', '-i!*.png' ], // only images
})
```

### Emoji and Unicode

Due to a `7z` limitation emojis and special characters can't be used as values
when passed to an `option` object (ex: password). But they can be used in
archive, filenames and destinations.

Use the *scc* switch `{ scc: 'UTF-8' }` for special characters.

### Log level

The default log level (`-bb` switch) is set to:
> 3 :show information about additional operations (Analyze, Replicate) for "Add"
> / "Update" operations.
It's a base feature of `node-7z` and is required for the module to work as 
expected. A diffrent value should not be used.

### Security

Values given by the package are not sanitized, you just get the raw output from
the `7z` binary. Remember to never trust user input and sanitize accordingly.

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
