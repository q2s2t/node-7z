// # node-7zip
// A Node.js wrapper for 7-Zip.
// [GitHub](https://github.com/quentinrossetti/node-7zip)
// I chose to use both promises and callbacks in this library. In all cases the
// API is consistent with standard use:
// Promise-style e.g:
// ```js
// var seven = new require('7z');
// seven.test('myArchive.7z')
//   .then(fulfillHandler, rejectHandler);
// ```
// Callback-style e.g:
// ```js
// var seven = new require('7z');
// seven.test('myArchive.7z', function (err, files) {
//   if (err) errorHandler;
//   successHandler;
// });
// ```
'use strict';
var os      = require('os');
var path    = require('path');
var process = require('child_process');
var events  = require('events');
var util    = require('util');
var spawn   = require('win-spawn');
var Promise = require('promise');


function Api(name) {
  this.name = (name) ? name : '7z';
}
util.inherits(Api, events.EventEmitter);


// ## API: test
// Test integrity of archive.
//
// ### Arguments
//  * `archive` The path to the archive you want to analyse.
//
// ### Return values
//  * `files` A array of all the files *AND* directories in the archives. The
//    `/` character is used as a path separator on every platform.
//  * `err` The error as issued by `child_process.exec`.
Api.prototype.test = Promise.denodeify(function (archive, callback) {

  archive = path.resolve(archive);
  var cmd = '7z t ' + archive;
  process.exec(cmd, function (err, stdout) {
    if (err) return callback(err, null);
    var r = [];
    stdout.split(os.EOL).forEach(function (_line) {
      if (_line.substr(0, 12) === 'Testing     ') {
        r.push(_line.substr(12, _line.length).replace(path.sep, '/'));
      }
    });
    return callback(null, r);
  });

});


// ## API: extract
// Extract with full paths
//
// ### Arguments
//  * `archive` The path to the archive you want to analyse.
//  * `dest` Where to extract the archive.
//
// ### Return values
//  * `files` A array of all the extracted files *AND* directories. The `/`
//    character is used as a path separator on every platform.
//  * `err` The error as issued by `child_process.exec`.
//
// ### Events
//  * `data` Emitted when files are extracted. Has one parameter `(files)`, an
//    array of files and directories processed.
Api.prototype.extract = Promise.denodeify(function (archive, dest, callback) {

  archive  = path.resolve(archive);
  dest     = path.resolve(dest);
  var self = this;
  var err  = null;
  var cmd  = ('x ' + archive + ' -y -o' + dest).split(' ');
  var run  = spawn('7z', cmd, {
    detached: true,
    stdio: 'pipe'
  });
  run.on('close', function (code) {
    if (err) {
      return callback(err);
    }
    return callback(null);
  });
  run.stdout.on('data', function (data) {
    var files = [];
    var regex = new RegExp('Error:' + os.EOL + '(.*)', 'g');
    var res   = regex.exec(data.toString());
    if (res) {
      err = new Error(res[1]);
    }
    data.toString().split(os.EOL).forEach(function (_line) {
      if (_line.substr(0, 12) === 'Extracting  ') {
        files.push(_line.substr(12, _line.length).replace(path.sep, '/'));
      }
    });
    self.emit('data', files);
  });

});


// Exports the Api object.
module.exports = Api;