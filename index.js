// # node-7zip
// A Node.js wrapper for 7-Zip.
// [GitHub](https://github.com/quentinrossetti/node-7zip)
// I chose to use both promises and callbacks in this library. In all cases the
// API is consistent with standard use:
// Promise-style e.g:
// ```js
// var seven = require('7z');
// seven.test('myArchive.7z')
//   .then(fulfillHandler, rejectHandler);
// ```
// Callback-style e.g:
// ```js
// var seven = require('7z');
// seven.test('myArchive.7z', function (err, files) {
//   if (err) errorHandler;
//   successHandler;
// });
// ```
'use strict';
var os      = require('os');
var path    = require('path');
var process = require('child_process');
var Promise = require('promise');

// ## API: test
// Test integrity of archive.
//
// ### Arguments
//  * `archivePath` The path to the archive you want to analyse.
//
// ### Return values
//  * `files` A array of all the files *AND* directories in the archives. The
//    `/` character is used as a path separator on every platform.
//  * `err` The error as issued by `child_process.exec`.
var test = function (archivePath) {

  archivePath     = path.resolve(archivePath);
  return new Promise(function (fulfill, reject) {
    var command = '7z t ' + archivePath;
    process.exec(command, function (err, stdout) {
      if (err) return reject(err);
      var r = [];
      stdout.split(os.EOL).forEach(function (_line) {
        if (_line.substr(0, 12) === 'Testing     ') {
          return r.push(_line.substr(12, _line.length).replace(path.sep, '/'));
        }
      });
      return fulfill(r);
    });
  });

};

module.exports.test = test;
module.exports.testNode = Promise.nodeify(test);

// ## API: extract
// Extract with full paths
//
// ### Arguments
//  * `archivePath` The path to the archive you want to analyse.
//  * `destinationPath` Where to extract the archive.
//
// ### Return values
//  * `files` A array of all the extracted files *AND* directories. The `/`
//    character is used as a path separator on every platform.
//  * `err` The error as issued by `child_process.exec`.
var extract = function (archivePath, destinationPath) {

  archivePath     = path.resolve(archivePath);
  destinationPath = path.resolve(destinationPath);
  return new Promise(function (fulfill, reject) {
    var command = '7z x ' + archivePath + ' -y -o' + destinationPath;
    process.exec(command, function (err, stdout) {
      if (err) return reject(err);
      var r = [];
      stdout.split(os.EOL).forEach(function (_line) {
        if (_line.substr(0, 12) === 'Extracting  ') {
          return r.push(_line.substr(12, _line.length).replace(path.sep, '/'));
        }
      });
      return fulfill(r);
    });
  });

};

module.exports.extract = extract;
module.exports.extractNode = Promise.nodeify(extract);