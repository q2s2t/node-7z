'use strict';
var path = require('path');
var when = require('when');
var u    = {
  files   : require('../util/files'),
  run     : require('../util/run'),
  switches: require('../util/switches'),
};

/**
 * Add content to an archive.
 * @promise Add
 * @param archive {string} Path to the archive.
 * @param file {string} File path to add.
 * @param data {string|Buffer|Uint8Array} File data to add.
 * @param options {Object} An object of acceptable options to 7za bin.
 * @resolve {array} Arguments passed to the child-process.
 * @progress {array} Listed files and directories.
 * @reject {Error} The error as issued by 7-Zip.
 */
module.exports = function (archive, file, data, options) {
  return when.promise(function (resolve, reject, progress) {

    // Create a string that can be parsed by `run`.
    var command = '7za a "' + archive + '"';

    var command_options = JSON.parse(JSON.stringify(options));
    command_options["si"] = file;

    // Start the command
    u.run(command, command_options, data)

    // When a stdout is emitted, parse each line and search for a pattern. When
    // the pattern is found, extract the file (or directory) name from it and
    // pass it to an array. Finally returns this array in the progress function.
    .progress(function (data) {
      var entries = [];
      data.split('\n').forEach(function (line) {
        if (line.substr(0, 13) === 'Compressing  ') {
          entries.push(line.substr(13, line.length).replace(path.sep, '/'));
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
