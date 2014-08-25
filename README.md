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

### Test integrity of archive: `Zip.test`

  **Arguments**
   * `archive` The path to the archive you want to analyse.
   * `options` An object of options.
  
  **Progress**
   * `files` A array of all the extracted files *AND* directories. The `/`
     character is used as a path separator on every platform.
  
  **Error**
   * `err` An Error object.

### Extract with full paths: `Zip.extractFull`

  **Arguments**
   * `archive` The path to the archive you want to analyse.
   * `dest` Where to extract the archive.
   * `options` An object of options.
  
  **Progress**
   * `files` A array of all the extracted files *AND* directories. The `/`
     character is used as a path separator on every platform.
  
  **Error**
   * `err` An Error object.

### Extract: `Zip.extract`

  **Arguments**
   * `archive` The path to the archive you want to analyse.
   * `dest` Where to extract the archive.
   * `options` An object of options.
  
  **Progress**
   * `files` A array of all the extracted files *AND* directories. The `/`
     character is used as a path separator on every platform.
  
  **Error**
   * `err` An Error object.

***
With :heart: from [quentinrossetti](https://github.com/quentinrossetti)

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
