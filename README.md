node-7zip
=========

[![Dependencies Status][david-image]][david-url] [![Build Status][travis-image]][travis-url] [![Code coverage][coveralls-image]][coveralls-url] [![Code quality][codeclimate-image]][codeclimate-url] [![Release][npm-image]][npm-url]

> A Node.js wrapper for 7-Zip

Usage
-----

I chose to use both promises and callbacks in this library. In all cases the
API is consistent with standard use:

Promise-style e.g:
```js
var Zip = require('7z');
var myTask = new Zip();
myTask.test('myArchive.7z')
  .then(fulfillHandler, rejectHandler);
```

Callback-style e.g:
```js
var Zip = require('7z');
var myTask = new Zip();
myTask.test('myArchive.7z', function (err, files) {
  if (err) errorHandler;
  successHandler;
});
```

Installation
------------

```cmd
npm install -g 7z
```

API
---

### Test integrity of archive: `test`

#### Arguments
 * `archive` The path to the archive you want to analyse.

#### Return values
 * `files` A array of all the files *AND* directories in the archives. The
   `/` character is used as a path separator on every platform.
 * `err` The error as issued by `child_process.exec`.

### Extract with full paths: `extract`

#### Arguments
 * `archive` The path to the archive you want to analyse.
 * `dest` Where to extract the archive.

#### Return values
 * `files` A array of all the extracted files *AND* directories. The `/`
   character is used as a path separator on every platform.
 * `err` The error as issued by `child_process.exec`.

#### Events
 * `data` Emitted when files are extracted. Has one parameter `(files)`, an
   array of files and directories processed.

***
With :heart: from [quentinrossetti](https://github.com/quentinrossetti)

[gemnasium-url]: https://gemnasium.com/quentinrossetti/node-7zip
[gemnasium-image]: http://img.shields.io/gemnasium/quentinrossetti/node-7zip.svg
[david-url]: https://david-dm.org/quentinrossetti/node-7zip
[david-image]: http://img.shields.io/david/quentinrossetti/node-7zip.svg
[travis-url]: https://travis-ci.org/quentinrossetti/node-7zip
[travis-image]: http://img.shields.io/travis/quentinrossetti/node-7zip.svg
[codeclimate-url]: https://codeclimate.com/github/quentinrossetti/node-7zip
[codeclimate-image]: http://img.shields.io/codeclimate/github/quentinrossetti/node-7zip.svg
[coveralls-url]: https://coveralls.io/r/quentinrossetti/node-7zip
[coveralls-image]: http://img.shields.io/coveralls/quentinrossetti/node-7zip.svg
[npm-url]: https://www.npmjs.org/package/node-7zip
[npm-image]: http://img.shields.io/npm/v/node-7zip.svg