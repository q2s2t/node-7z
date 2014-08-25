node-7z
=======

[![Dependencies Status][david-image]][david-url] [![Build Status][travis-image]][travis-url] [![Code coverage][coveralls-image]][coveralls-url] [![Code quality][codeclimate-image]][codeclimate-url] [![Release][npm-image]][npm-url]

> A Node.js wrapper for 7-Zip

Usage
-----

I chose to use *Promises* in this library. API is consistent with standard use:

```js
var Zip = require('7z'); // Name the class as you want!
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
.catch(function (err, code) {
  console.error('7-Zip exit with code %i', code);
  console.error(err);
});
```

Installation
------------

You must have the `7z` executable available in your PATH. In some GNU/Linux
distributions install the `p7zip-full`.

```
npm install --save 7z
```

API
---

### Extract with full paths: `Zip.extractFull`

**Arguments**
 * `archive` The path to the archive you want to analyse.
 * `dest` Where to extract the archive.
 * `options` An object of options.

**Progress**
 * `files` A array of all the extracted files *AND* directories. The `/`
   character is used as a path separator on every platform.

**Error**
 * `err` An Error object. Its message is the message outputed by 7-Zip.
 * `code` 7-Zip [exit code](http://sevenzip.sourceforge.jp/chm/cmdline/exit_codes.htm).

### Extract: `Zip.extract`

**Arguments**
 * `archive` The path to the archive you want to analyse.
 * `dest` Where to extract the archive.
 * `options` An object of options.

**Progress**
 * `files` A array of all the extracted files *AND* directories. The `/`
   character is used as a path separator on every platform.

**Error**
 * `err` An Error object. Its message is the message outputed by 7-Zip.
 * `code` 7-Zip [exit code](http://sevenzip.sourceforge.jp/chm/cmdline/exit_codes.htm).

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
