"use strict";
var path = require("path");
var when = require("when");
var u = {
  run: require("../util/run"),
  switches: require("../util/switches"),
  path    : require('../util/path')
};

/**
 * List contents of archive.
 * @promise List
 * @param archive {string} Path to the archive.
 * @param options {Object} An object of acceptable options to 7za bin.
 * @progress {array} Listed files and directories.
 * @resolve {Object} Tech spec about the archive.
 * @reject {Error} The error as issued by 7-Zip.
 */
module.exports = function(archive, optionspath, options) {
    // Check options for `path` to pass path to binary to be parsed by `run`.
    var command = u.path(optionspath);
  return when.promise(function(resolve, reject, progress) {
    var spec = {};
    /* jshint maxlen: 130 */
    var regex = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) ([\.DA]+)\s+(\d+)\s*(?:\d+)\s+(\S+?\.\S+)/;
    /* jshint maxlen: 80 */

    // Create a string that can be parsed by `run`.
    command += ' l "' + archive + '" ';

    var buffer = ""; //Store imcomplete line of a progress data.
    // Start the command
    u
      .run(command, options)
      // When a stdout is emitted, parse each line and search for a pattern. When
      // the pattern is found, extract the file (or directory) name from it and
      // pass it to an array. Finally returns this array.
      .progress(function(data) {
        var entries = [];

        // Last progress had an incomplete line. Prepend it to the data and clear
        // buffer.
        if (buffer.length > 0) {
          data = buffer + data;
          buffer = "";
        }

        data.split("\n").forEach(function(line) {
          // Populate the tech specs of the archive that are passed to the
          // resolve handler.
          if (line.substr(0, 7) === "Path = ") {
            spec.path = line.substr(7, line.length);
          } else if (line.substr(0, 7) === "Type = ") {
            spec.type = line.substr(7, line.length);
          } else if (line.substr(0, 9) === "Method = ") {
            let method = line.substr(9, line.length);
            if (method) spec.method = method;
          } else if (line.substr(0, 16) === "Physical Size = ") {
            spec.physicalSize = parseInt(line.substr(16, line.length), 10);
          } else if (line.substr(0, 15) === "Headers Size = ") {
            spec.headersSize = parseInt(line.substr(15, line.length), 10);
          } else if (line.substr(0, 12) === "Encrypted = ") {
            if (spec.encrypted !== "+")
              spec.encrypted = line.substr(12, line.length);
          } else {
            // Parse the stdout to find entries
            var res = regex.exec(line);
            if (res) {
              if (parseInt(res[1])) {
                var return_date = new Date(res[1]);
              } else {
                var return_date = null;
              }

              var e = {
                date: return_date,
                attr: res[2],
                size: parseInt(res[3], 10),
                name: res[5].replace(path.sep, "/")
              };

              entries.push(e);
            } else
              // Line may be incomplete, Save it to the buffer.
              buffer = line;
          }
        });
        return progress(entries);
      })
      // When all is done resolve the Promise.
      .then(function() {
        return resolve(spec);
      })
      // Catch the error and pass it to the reject function of the Promise.
      .catch(function(err) {
        return reject(err);
      });
  });
};
