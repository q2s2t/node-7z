'use strict';
var path = require('path');
var when = require('when');
var u = {
  run: require('../util/run'),
  switches : require('../util/switches')
};

/**
 * Add content to an archive.
 * @promise Add
 * @param archive {string} Path to the archive.
 * @param files {string|Array} Files to add.
 * @param options {Object} An object of acceptable options to 7za bin.
 * @progress {array} Listed files and directories.
 * @reject {Error} The error as issued by 7-Zip.
 */
module.exports = function (archive, files, options) {
  return when.promise(function (fulfill, reject, progress) {

    var toAdd = '';
    if (files instanceof Array) {
      files.forEach(function (f) {
        toAdd += '"' + f + '" ';
      });
      toAdd = toAdd.trim();
    } else {
      toAdd = '"' + files + '"';
    }

    var command = '7za a "' + archive + '" ' + toAdd;

    u.run(command, options)

    // When a stdout is emitted, parse each line and search for a pattern. When
    // the pattern is found, extract the file (or directory) name from it and
    // pass it to an array. Finally returns this array.
    .progress(function (data) {
      var entries = [];
      data.split('\n').forEach(function (line) {
        if (line.substr(0, 13) === 'Compressing  ') {
          entries.push(line.substr(13, line.length).replace(path.sep, '/'));
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

  });
};
