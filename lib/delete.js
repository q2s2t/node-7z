'use strict';
var when = require('when');
var u    = {
  files   : require('../util/files'),
  run     : require('../util/run'),
  switches: require('../util/switches'),
  path    : require('../util/path')
};

/**
 * Delete content to an archive.
 * @promise Delete
 * @param archive {string} Path to the archive.
 * @param files {string|array} Files to add.
 * @param options {Object} An object of acceptable options to 7za bin.
 * @resolve {array} Arguments passed to the child-process.
 * @reject {Error} The error as issued by 7-Zip.
 */
module.exports = function (archive, files, optionspath, options) {
    // Check options for `path` to pass path to binary to be parsed by `run`.
    var command = u.path(optionspath);
  return when.promise(function (resolve, reject) {

    // Convert array of files into a string if needed.
    files = u.files(files);

    // Create a string that can be parsed by `run`.
    command += ' d "' + archive + '" ' + files;

    // Start the command
    u.run(command, options)

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
