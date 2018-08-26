'use strict';

/**
 * Transform a list of files that can be an array or a string into a string
 * that can be passed to the `run` function as part of the `command` parameter.
 * @param  {string|array} files
 * @return {string}
 */
module.exports = function (files) {

  if (files === undefined) {
    return '';
  }

  var toProcess = '';
  if (files instanceof Array) {
    files.forEach(function (f) {
      toProcess += '"' + f + '" ';
    });
    toProcess = toProcess.trim();
  } else {
    toProcess = '"' + files + '"';
  }
  return toProcess;

};
