'use strict';

var Promise = require('promise');
var process = require('child_process');
var os = require('os');
var path = require('path');

module.exports.test = function test(archivePath) {

  return new Promise(function (fulfill, reject){
    var command = '7z t ' + archivePath;
    process.exec(command, function (err, stdout, stderr) {
      //TODO: Custom error
      if (err) return reject(err);
      if (stderr) return reject(stderr);
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
