'use strict';
var path = require('path');
var when = require('when');
var u    = {
  run     : require('../util/run'),
  switches: require('../util/switches')
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
          let retval = parseSltOutput(data, filesRequiredFields);
          return resolve(retval);
        }
        catch(err) {
          return reject(retval);
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
            pec.encrypted = line.substr(12, line.length);
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

const propertyDelim = ' = ';

function parseProperty(data, propObj, requiredPropertyArr) {
  let pos = data.indexOf(propertyDelim);

  if (pos === -1) {
    return;
  }

  let key = data.substring(0, pos);
  let value = data.substring(pos + propertyDelim.length, data.length);
  if (isRequiredProperty(requiredPropertyArr, key)) {
    propObj[key] = value;
  }
};

const metaBegining = '--';
const metaDataDelim = '----------';
const fileDelim = '';

/*
 * Output of 7z with slt option contains 7z version. '--', metaData, '----------', and fileData for each archived file separated by an empty line.
 * Both metaData and fileData are set of <key> =  <value> separated by a new line

 * Example:
 *
 * 7-Zip [64] 9.20  Copyright (c) 1999-2010 Igor Pavlov  2010-11-18
 * p7zip Version 9.20 (locale=en_US.UTF-8,Utf16=on,HugeFiles=on,4 CPUs)
 *
 * Listing archive: example.7z
 *
 * --
 * Path = example.7z
 * Type = 7z
 * Method = LZMA
 * Solid = +
 * Blocks = 1
 * Physical Size = 24948
 * Headers Size = 178

 * ----------
 * Path = test.7z
 * Size = 304
 * Packed Size = 24770
 * Modified = 2017-03-20 13:10:16
 * Attributes = ....A
 * CRC = 55F6B511
 * Encrypted = -
 * Method = LZMA:16
 * Block = 0

 * Path = test.zip
 * Size = 24305
 * Packed Size = 
 * Modified = 2016-03-06 13:55:38
 * Attributes = ....A
 * CRC = F891B5C2
 * Encrypted = -
 * Method = LZMA:16
 * Block = 0
 */
function parseSltOutput(data, filesRequiredFields) {
  let lines = data.split('\n');
  let retval = {metaData: {}, files: []};

  let i = lines.indexOf(metaBegining);
  if (i < 0) {
    throw new Error('Invalid data ' + JSON.stringify(data));
  }

  for (i = i + 1; i < lines.length && lines[i] !== metaDataDelim; i++) {
    if (lines[i].length === 0) {
      continue;
    }

    parseProperty(lines[i], retval.metaData, null /* shouldn't filter metaData properties */);
  }

  i++; //for metaDataDelim

  //parse files
  for (; i < lines.length; i++) {
    if (!lines[i].length) {
      continue;
    }
    let file = {};
    for (; i < lines.length && lines[i] !== fileDelim; i++) {
      parseProperty(lines[i], file, filesRequiredFields);
    }

     retval.files.push(file);
  }

  return retval;
};
