'use strict';
var path = require('path');
var when = require('when');
var u = {
  run: require('../util/run'),
  switches : require('../util/switches')
};

/**
 * List contents of archive.
 * @promise List
 * @param archive {string} Path to the archive.
 * @param options {Object} An object of acceptables options to 7z bin.
 * @progress {array} Listed files and directories.
 * @filfull {Object} Tech spec about the archive.
 * @reject {Error} The error as issued by 7-Zip.
 */
module.exports = function (archive, options) {
  return when.promise(function (fulfill, reject, progress) {

    if (options === undefined) {
      options = {};
    }

    var opts  = u.switches(options);
    var spec  = {};
    var regex = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) ([\.DA]+) +(\d+)[ \d]+  (.+)/;
    var command = '7z l ' + archive + ' ' + opts;
    u.run(command)

    // When a stdout is emitted, parse each line and search for a pattern. When
    // the pattern is found, extract the file (or directory) name from it and
    // pass it to an array. Finally returns this array.
    .progress(function (data) {
      var entries = [];
      data.split('\n').forEach(function (line) {
        
        // Populate the tech specs of the archive that are passed to the 
        // fulfill handler.
        if (line.substr(0, 7) === 'Path = ') {
          spec.path = line.substr(7, line.length);
        } else if (line.substr(0, 7) === 'Type = ') {
          spec.type = line.substr(7, line.length);
        } else if (line.substr(0, 9) === 'Method = ') {
          spec.method = line.substr(9, line.length);
        } else if (line.substr(0, 16) === 'Physical Size = ') {
          spec.physicalSize = parseInt(line.substr(16, line.length), 10);
        } else if (line.substr(0, 15) === 'Headers Size = ') {
          spec.headersSize = parseInt(line.substr(15, line.length), 10);
        } else {

          // Parse the stdout to find entries
          var res = regex.exec(line);
          if (res) {
            var e = {
              date: new Date(res[1]),
              attr: res[2],
              size: parseInt(res[3], 10),
              name: res[4].replace(path.sep, '/')
            };
            entries.push(e);
          }

        }
      });
      progress(entries);
    })
    
    .then(function () {
      fulfill(spec);
    })
    
    .catch(function (err) {
      reject(err);
    });

  });
};
