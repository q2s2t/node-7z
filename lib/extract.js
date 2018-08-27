'use strict';
var path = require('path');
var when = require('when');
var u    = {
  run     : require('../util/run'),
  switches: require('../util/switches')
};

/**
 * Extract an archive.
 * @promise Extract
 * @param {string} archive Path to the archive.
 * @param {string} dest Destination.
 * @param options {Object} An object of acceptable options to 7za bin.
 * @resolve {array} Arguments passed to the child-process.
 * @progress {array} Extracted files and directories.
 * @reject {Error} The error as issued by 7-Zip.
 */

module.exports = function (archive, dest, options) {
  return when.promise(function (resolve, reject, progress) {

    // Create a string that can be parsed by `run`.
    var command = '7za e "' + archive + '" -o"' + dest + '" ';

    // Start the command
    u.run(command, options)

    // When a stdout is emitted, parse each line and search for a pattern. When
    // the pattern is found, extract the file (or directory) name from it and
    // pass it to an array. Finally returns this array.
    .progress(function (data) {
      var entries = [];

      data.split('\n').forEach(function (line) {
        if (line.substr(0, 1) === '-') {
          entries.push(line.substr(2, line.length).replace(path.sep, '/'));
        }
      });
      return progress(entries);
    })

    // When all is done resolve the Promise.
    .then(function (args) {
      return resolve(args);
    })

    // Catch the error and pass it to the reject function of the Promise.
    .catch(function (err) {
      return reject(err);
    });

  });
};
