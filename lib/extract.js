'use strict';
var path = require('path');
var when = require('when');
var u = {
  run: require('../util/run'),
  switches : require('../util/switches')
};

/**
 * Extract an archive.
 * @promise Extract
 * @progress {array} Extracted files and directories.
 * @reject {Error} The error as issued by 7-Zip.
 */
module.exports = function (archive, dest, options) {
  return when.promise(function (fulfill, reject, progress) {

    if (options === undefined) {
      options = {};
    }

    var opts = u.switches(options);
    var command = '7z e ' + archive + ' -o' + dest + ' ' + opts;
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
      progress(entries);
    })
    
    .then(function () {
      fulfill();
    })
    
    .catch(function (err) {
      reject(err);
    });

  })
};
