'use strict';
var path = require('path');
var when = require('when');
var u = {
  run: require('../util/run'),
  switches : require('../util/switches')
};

/**
 * Delete content to an archive.
 * @promise Delete
 * @param archive {string} Path to the archive.
 * @param files {string} Files to delete.
 * @param options {Object} An object of acceptables options to 7z bin.
 * @progress {array} Listed files and directories.
 * @reject {Error} The error as issued by 7-Zip.
 */
module.exports = function (archive, files, options) {
  return when.promise(function (fulfill, reject, progress) {

    var command = '7za d "' + archive + '" "' + files + '"';
    u.run(command, options)

    .then(function () {
      fulfill();
    })

    .catch(function (err) {
      reject(err);
    });

  });
};
