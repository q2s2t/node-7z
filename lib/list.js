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

module.exports = function (archive, options) {
  return when.promise(function (resolve, reject, progress) {

    var spec  = {};
    /* jshint maxlen: 130 */
    var regex = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) ([\.D][\.R][\.H][\.S][\.A]) +(\d+) +(\d+)? +(.+)/;
    /* jshint maxlen: 80 */

    // Create a string that can be parsed by `run`.
    var command = '7za l "' + archive + '" ';

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

        data.split("\n").forEach(function(line) {
      if (options && options.slt) {
        try {
          buffer = parseSltOutputStream(data, filesRequiredFields, spec);
          return progress(spec);
        }
        catch(err) {
          return reject(err);
        }
      }

      data.split('\n').forEach(function (line) {

        // Populate the tech specs of the archive that are passed to the
        // resolve handler.
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

            if (parseInt(res[1])) {
              var return_date = new Date(res[1]);
            } else {
              var return_date = null;
            }
              
            var e = {
              date: new Date(res[1]),
              attr: res[2],
              size: parseInt(res[3], 10),
              name: res[5].replace(path.sep, '/')
            }

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
});
}

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
 * Example:
 * 7-Zip [64] 9.20  Copyright (c) 1999-2010 Igor Pavlov  2010-11-18
 * p7zip Version 9.20 (locale=en_US.UTF-8,Utf16=on,HugeFiles=on,4 CPUs)
 *
 * Listing archive: password_protected_zip_with_pdf_pass_is_1234.ZIP
 *
 * --
 * Path = password_protected_zip_with_pdf_pass_is_1234.ZIP
 * Type = zip
 * Physical Size = 31703
 *
 * ----------
 * Path = allowed_image.jpg
 * Folder = -
 * Size = 34530
 * Packed Size = 28839
 * Modified = 2016-02-29 19:01:01
 * Created = 2016-02-29 19:01:01
 * Accessed = 2016-02-29 19:01:01
 * Attributes = ....A
 * Encrypted = +
 * Comment =
 * CRC = 2A63718C
 * Method = ZipCrypto Deflate
 * Host OS = FAT
 * Version = 20
 *
 * Path = ski_equipment.pdf
 * Folder = -
 * Size = 3903
 * Packed Size = 2550
 * Modified = 2016-03-08 13:29:14
 * Created = 2016-03-08 13:29:14
 * Accessed = 2016-03-08 13:29:14
 * Attributes = ....A
 * Encrypted = +
 * Comment =
 * CRC = 20B2CC8A
 * Method = ZipCrypto Deflate
 * Host OS = FAT
 * Version = 20
 *
 *
 * End of example output
 * params:
 *  data - cmd output to parse
 *  filesRequiredFields - file required field, if not null, then other fields won't be parsed
 *
 *  return value - data to aggregate for next iteration
 */
function parseSltOutputStream(data, filesRequiredFields, parsingProgress) {
  let lines = data.split('\n');
  let metaData = {};
  let i = 0;

  // in case metaData hasn't parsed, can happen in first iteration of the streamed output or theoretically if
  // metadata wasn't fully available in the previous iteration
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
        // In case didn't reach META_DATA_DELIM then need more data to parse matadata, returns all data to be aggregated for next iteration
        return data;
    }
    // finished to parse metaData, saving it on parsingProgress and start parsing the files data
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
    for (; i < lines.length - 1 && lines[i] !== FILE_DELIM; ++i) {
      parseProperty(lines[i], file, filesRequiredFields);
    }

    if (i >= lines.length - 1) {
        // In case didn't reach FILE_DELIM then need more data to parse file,
        // ignoring it and returns all file data to be aggregated for next iteration
        // file start line data saved in startFileDataLine
        //
        // Note that iteration ignores the last part for
        // case that the last byte of the streamed chunked data is '\n' we want to remove it and append it to next chunk
        // since we use split("\n") and we might mistakenly identify it as delimiter (parsing the file's data as two files)
        //
        // for example, if the following streams in two chunks:
        // Path = allowed_image.jpg
        // Folder = -
        // Size = 34530
        // Packed Size = 28839
        // Modified = 2016-02-29 19:01:01
        // Created = 2016-02-29 19:01:01
        // Accessed = 2016-02-29 19:01:01
        // Attributes = ....A
        // Encrypted = +
        // Comment =
        // CRC = 2A63718C
        // Method = ZipCrypto Deflate
        // Host OS = FAT
        // Version = 20
        //
        // chunk 1:
        // Path = allowed_image.jpg
        // Folder = -
        // Size = 34530
        // Packed Size = 28839
        // Modified = 2016-02-29 19:01:01
        // Created = 2016-02-29 19:01:01
        // Accessed = 2016-02-29 19:01:01
        //
        // chunk 2:
        // Attributes = ....A
        // Encrypted = +
        // Comment =
        // CRC = 2A63718C
        // Method = ZipCrypto Deflate
        // Host OS = FAT
        // Version = 20
        //
        //
        // Since output ends with "\n\n" the las file in the stream should be parsed successfully
        return lines.slice(startFileDataLine).join("\n");
    }
    // finish to parse the file, adding it to parsingProgress.files
    parsingProgress.files.push(file);
  }

  return "";
};
