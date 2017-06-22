'use strict';
var path = require('path');
var when = require('when');
var u    = {
  run     : require('../util/run'),
  switches: require('../util/switches')
};

const PROPERTY_DELIM = ' = ';
const META_BEGINNING = '--';
const META_DATA_DELIM = '----------';
const FILE_DELIM = '';

/**
 * List contents of archive.
 * @promise List
 * @param archive {string} Path to the archive.
 * @param options {Object} An object of acceptable options to 7za bin.
 * @progress {array} Listed files and directories.
 * @resolve {Object} Tech spec about the archive.
 * @reject {Error} The error as issued by 7-Zip.
 */
module.exports = function (archive, options, filesRequiredFields) {
  return when.promise(function (resolve, reject, progress) {

    var spec  = {};
    /* jshint maxlen: 130 */
    var regex = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) ([\.DA]+)\s+(\d+)\s*(?:\d+)\s+(\S+?\.\S+)/; 
    /* jshint maxlen: 80 */

    // Create a string that can be parsed by `run`.
    var command = '7z l "' + archive + '" ';

    var buffer = ""; //Store imcomplete line of a progress data.
    // Start the command
    u.run(command, options)

    // When a stdout is emitted, parse each line and search for a pattern. When
    // the pattern is found, extract the file (or directory) name from it and
    // pass it to an array. Finally returns this array.
    .progress(function (data) {
      var entries = [];

      // Last progress had an incomplete line. Prepend it to the data and clear
      // buffer.
      if (buffer.length > 0) {
        data = buffer + data;
        buffer = "";
      }

      if (options && options.slt) {
        try {
          buffer = parseSltOutputStream(data, filesRequiredFields, spec);
          return progress(spec);
        }
        catch(err) {
          return reject(err);
        };
      }

      data.split('\n').forEach(function (line) {
        // Populate the tech specs of the archive that are passed to the
        // resolve handler.
        if (line.substr(0, 7) === 'Path = ') {
          if (isRequiredProperty(filesRequiredFields, 'Path')) {
            spec.path = line.substr(7, line.length);
          }
        } else if (line.substr(0, 7) === 'Type = ') {
          if (isRequiredProperty(filesRequiredFields, 'Type')) {
            spec.type = line.substr(7, line.length);
          }
        } else if (line.substr(0, 9) === 'Method = ') {
          if (isRequiredProperty(filesRequiredFields, 'Method')) {
            spec.method = line.substr(9, line.length);
          }
        } else if (line.substr(0, 16) === 'Physical Size = ') {
          if (isRequiredProperty(filesRequiredFields, 'Physical Size')) {
            spec.physicalSize = parseInt(line.substr(16, line.length), 10);
          }
        } else if (line.substr(0, 15) === 'Headers Size = ') {
          if (isRequiredProperty(filesRequiredFields, 'Headers Size')) {
            spec.headersSize = parseInt(line.substr(15, line.length), 10);
          }
        } else if (line.substr(0, 12) === 'Encrypted = ') {
          if (isRequiredProperty(filesRequiredFields, 'Encrypted')) {
            spec.encrypted = line.substr(12, line.length);
          }
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
              name: res[5].replace(path.sep, '/')
            };

            entries.push(e);
          }

          // Line may be incomplete, Save it to the buffer.
          else buffer = line;

        }
      });
      return progress(entries);
    })

    // When all is done resolve the Promise.
    .then(function () {
      return resolve(spec);
    })

    // Catch the error and pass it to the reject function of the Promise.
    .catch(function (err) {
      return reject(err);
    });

  });
};

function isRequiredProperty(requiredPropertyArr, name) {
  return !requiredPropertyArr || (requiredPropertyArr.indexOf(name) >= 0);
}

function parseProperty(data, propObj, requiredPropertyArr) {
  let pos = data.indexOf(PROPERTY_DELIM);

  if (pos === -1) {
    return;
  }

  let key = data.substring(0, pos);
  let value = data.substring(pos + PROPERTY_DELIM.length, data.length);
  if (isRequiredProperty(requiredPropertyArr, key)) {
    propObj[key] = value;
  }
};

/*
 * Output of 7z with slt option contains 7z version. '--', metaData, '----------', and fileData for each archived file separated by an empty line.
 * Both metaData and fileData are set of <key> =  <value> separated by a new line
 *
 * params:
 *  data - cmd output to parse
 *  filesRequiredFields - file required field, if not null, then other fields won't be parsed
 *
 *  return value - data to aggregate for next iteration
 */
function parseSltOutputStream(data, filesRequiredFields, parsingProgress) {
  let   lines = data.split('\n');
  var   metaData = {};
  let   i = 0;

  if (!parsingProgress.metaData) {
    i = lines.indexOf(META_BEGINNING);
    if (i < 0) {
      throw new Error('Invalid data ' + JSON.stringify(data));
    }

    for (i = i + 1; i < lines.length && lines[i] !== META_DATA_DELIM; ++i) {
      if (lines[i].length === 0) {
        continue;
      }

      parseProperty(lines[i], metaData, null /* shouldn't filter metaData properties */);
    }

    if (i >= lines.length) {
        //need more data to parse matadata, returns all data to be aggregated for next iteration
        return data;
    }

    parsingProgress.metaData = metaData;
    parsingProgress.files = [];
  }

  //parse files
  for (i = i + 1; i < lines.length; ++i) {
    if (lines[i].length === 0) {
      continue;
    }
    let file = {};
    let startFileDataLine = i;
    for (; i < lines.length && lines[i] !== FILE_DELIM; ++i) {
      parseProperty(lines[i], file, filesRequiredFields);
    }

    if (i >= lines.length) {
        //need more data to parse file, ignoring it and returns all file data to be aggregated for next iteration
        return lines.slice(startFileDataLine - 1).join("\n");
    }
    parsingProgress.files.push(file);
  }

  return "";
};
