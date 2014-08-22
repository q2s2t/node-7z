'use strict';
var os      = require('os');
var path    = require('path');
var process = require('child_process');
var events  = require('events');
var util    = require('util');
var spawn   = require('win-spawn');
var Promise = require('promise');

// Create an Api class that extends the EventEmitter.
function Api(name) {
  this.name = (name) ? name : '7z';
}
util.inherits(Api, events.EventEmitter);

function concatSwitches(switches) {
  var r = '';
  var c = '';
  for (var s in switches) {
    c = switches[s];
    c = (c === true) ? '' : c;
    r += '-' + s + c;
  }
}

// Adds files to archive.
Api.prototype.add = Promise.denodeify(function (archive, files, switches, cb) {
  
  // When no switches are speciied use the given function as the callback and
  // set switches as an empty object.
  if (typeof switches === 'function') {
    cb = switches;
    switches = {};
  }
  archive = path.resolve(archive);
  
  
});


// Test integrity of archive.
Api.prototype.test = Promise.denodeify(function (archive, callback) {

  archive = path.resolve(archive);
  var cmd = '7z t ' + archive;
  process.exec(cmd, function (err, stdout) {
    if (err) return callback(err, null);
    // Parse each line of the stdout and build an array of files (and 
    // directories) tested. The / is used in the result instead of the default
    // OS path separator.
    var r = [];
    stdout.split(os.EOL).forEach(function (_line) {
      if (_line.substr(0, 12) === 'Testing     ') {
        r.push(_line.substr(12, _line.length).replace(path.sep, '/'));
      }
    });
    return callback(null, r);
  });

});


// Extract with full paths.
Api.prototype.extract = Promise.denodeify(function (archive, dest, callback) {

  archive  = path.resolve(archive);
  dest     = path.resolve(dest);
  var self = this;
  var err  = null;
  var cmd  = ('x ' + archive + ' -y -o' + dest).split(' ');
  var run  = spawn('7z', cmd, { stdio: 'pipe' });
  
  run.on('close', function (code) {
    if (err) return callback(err);
    return callback(null);
  });
  
  run.stdout.on('data', function (data) {
    // When an stdout is emitted, parse it. If an error is detected in the body
    // of the stdout create an new error with the 7-Zip error message as the 
    // error's message. Otherwise emit a `data` event with the processed files 
    // and directories as an array.
    var files = [];
    var regex = new RegExp('Error:' + os.EOL + '(.*)', 'g');
    var res   = regex.exec(data.toString());
    if (res) err = new Error(res[1]);
    data.toString().split(os.EOL).forEach(function (_line) {
      if (_line.substr(0, 12) === 'Extracting  ') {
        files.push(_line.substr(12, _line.length).replace(path.sep, '/'));
      }
    });
    self.emit('data', files);
  });

});


module.exports = Api;
