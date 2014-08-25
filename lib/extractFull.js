'use strict';
var path = require('path');
var Q = require('q');
var u = {
  run: require('../util/run')
};

module.exports = function (archive, dest, options, cb) {
  return Q.Promise(function (resolve, reject, notify) {
    
    //TODO: parse options, -y always true?
    var opts = '';
    var command = '7z x ' + archive + ' -o' + dest + ' ' + opts;
    u.run(command)
    
    // When a stdout is emitted, parse each line and search for a pattern. When
    // the pattern is found, extract the file (or directory) name from it and
    // pass it to an array. Finally returns this array.
    .progress(function (data) {
      var entries = [];
      data.split('\n').forEach(function (line) {
        if (line.substr(0, 12) === 'Extracting  ') {
          entries.push(line.substr(12, line.length).replace(path.sep, '/'));
        }
      });
      notify(entries);
    })
    
    .then(function () {
      resolve();
    })
    
    .catch(function (err) {
      reject(err);
    });
    
  }).nodeify(cb);
};
