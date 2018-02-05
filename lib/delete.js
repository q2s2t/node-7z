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
module.exports = function (archive, files, options) {
  return when.promise(function (resolve, reject) {

    // Convert array of files into a string if needed.
    files = u.files(files);

    // Create a string that can be parsed by `run`.
    try {
        if (options.path) {
            var command = u.path(options);
            command += ' d "' + archive + '" ' + files;
        } else var command = '7za d "' + archive + '" ' + files;
    } catch (e) {
        var command = '7za d "' + archive + '" ' + files;
    }

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
