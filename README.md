node-7z
=======

[![Dependencies Status][david-image]][david-url] [![Build Status][travis-image]][travis-url] [![Code coverage][coveralls-image]][coveralls-url] [![Release][npm-image]][npm-url]

> A Node.js wrapper for 7-Zip *with platform binaries*

Usage
-----

I chose to use *Promises* in this library. API is consistent with standard use:

```js
var Zip = require('node-7z'); // Name the class as you want!
var myTask = new Zip();
myTask.extractFull('myArchive.7z', 'destination', { p: 'myPassword' })

// Equivalent to `on('data', function (files) { // ... });`
.progress(function (files) {
  console.log('Some files are extracted: %s', files);
});

// When all is done
.then(function () {
  console.log('Extracting done!');
});

// On error
.catch(function (err) {
  console.error(err);
});
```

Installation
------------

This package download binaries are at install time. Host system does not need to have 7zip installed or in PATH. 

The binaries will be downloaded from:
> On Linux - https://sourceforge.net/projects/p7zip
> On Windows - http://www.7-zip.org/download.html
> On Mac OSX - http://rudix.org/packages/p7zip.html
  Note: Mac OSX 10.6 to 10.12 are pre included, to reinstall `npm run-script prepack` this must be done on a windows platform.

```
npm install --save node-7z
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

With the `7za` binary compression is made like that:

```bat
# adds *.exe and *.dll files to solid archive archive.7z using LZMA method
# with 2 MB dictionary and BCJ filter.
7z a archive.7z *.exe -m0=BCJ -m1=LZMA:d=21
```

With **node-7z** you can translate it like that:

```js
var archive = new Zip();
archive.add('archive.7z', '*.exe', {
  m0: '=BCJ',
  m1: '=LZMA:d=21'
})
.then(function () {
  // Do stuff...
});
```

### Add, delete and update multiple files

When adding, deleting or updating archives you can pass either a string or an
array as second parameter (the `files` parameter).

```js
var archive = new Zip();
archive.delete('bigArchive.7z', [ 'file1', 'file2' ])
.then(function () {
  // Do stuff...
});
```

### Wildcards

You can extract with wildcards to specify one or more file extensions. To do
this add a `wildcards` attribute to the `options` object. The `wildcard`
attribute takes an *Array* as value. In this array each item is a wildcard.

```js
var archive = new Zip();
archive.extractFull('archive.zip', 'destination/', {
  wildcards: [ '*.txt', '*.md' ], // extract all text and Markdown files
  r: true // in each subfolder too
})
.progress(function (files) {
  // Do stuff with files...
})
.then(function () {
  // Do stuff...
});
```

Note that the `r` (for recursive) attribute is passed in this example.


### Raw inputs

> Thanks to sketchpunk #9 for this one

Sometimes you just want to use the lib as the original command line. For
instance you want to apply to switches with different values (e.g.:
`-i!*.jpg -i!*.png` to target only two types of extensions).

In such cases the default behavior of the `options` argument is not enough. You
can use the custom `raw` key in your `options` object and pass it an *Array* of
values.

```js
var archive = new Zip();
archive.list('archive.zip', {
  raw: [ '-i!*.jpg', '-i!*.png' ], // only images
})
.progress(function (files) {
  // Do stuff with files...
})
.then(function () {
  // Do stuff...
});
```


***
With :heart: from [quentinrossetti](http://quentinrossetti.me/)

[david-url]: https://david-dm.org/quentinrossetti/node-7z
[david-image]: http://img.shields.io/david/quentinrossetti/node-7z.svg
[travis-url]: https://travis-ci.org/quentinrossetti/node-7z
[travis-image]: http://img.shields.io/travis/quentinrossetti/node-7z.svg
[codeclimate-url]: https://codeclimate.com/github/quentinrossetti/node-7z
[codeclimate-image]: http://img.shields.io/codeclimate/github/quentinrossetti/node-7z.svg
[coveralls-url]: https://coveralls.io/r/quentinrossetti/node-7z
[coveralls-image]: http://img.shields.io/coveralls/quentinrossetti/node-7z.svg
[npm-url]: https://www.npmjs.org/package/node-7z
[npm-image]: http://img.shields.io/npm/v/node-7z.svg
