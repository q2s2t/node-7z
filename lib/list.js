'use strict';
var path = require('path');
var when = require('when');
var _ = require('underscore');

var u = {
    run: require('../util/run'),
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
module.exports = function(archive, options) {
    function parseProperty(data) {
        const propertyDelim = ' = ';

        let pos = data.indexOf(propertyDelim);
        let property = {};

        if (pos === -1) {
            return null;
        }

        let key = data.substring(0, pos);
        let value = data.substring(pos + propertyDelim.length, data.length);
        property[key] = value;
        return property;
    };

    function parseSltOutput(data) {
        const metaBegining = '--';
        const metaDataDelim = '----------';
        const fileDelim = '';

        let lines = data.split('\n');
        let retval = {};

        let i = 0;

        for (; i < lines.length && (lines[i].indexOf(metaBegining) !== 0); i++);
        i++; //skip the beginning

        let metaData = {};
        for (; i < lines.length && lines[i] !== metaDataDelim; i++) {
            if (lines[i].length === 0) {
                continue;
            }

            let property = parseProperty(lines[i]);
            metaData = _.extend(metaData, property);
        }

        retval.metaData = metaData;
        i++; //for metaDataDelim

        //parse files
        let files = [];
        for (; i < lines.length; i++) {
            if (!lines[i].length) {
                continue;
            }
            let file = {};
            for (; i < lines.length && lines[i] !== fileDelim; i++) {
                let property = parseProperty(lines[i]);
                file = _.extend(file, property);
            }

            files.push(file);
        }

        retval.files = files;
        return retval;
    };

    return when.promise(function(resolve, reject, progress) {

        var spec = {};
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
        .progress(function(data) {
            var entries = [];

            // Last progress had an incomplete line. Prepend it to the data and clear
            // buffer.
            if (buffer.length > 0) {
                data = buffer + data;
                buffer = "";
            }

            if (options && options.slt) {
                let retval = parseSltOutput(data);
                return resolve(retval);
            }

            data.split('\n').forEach(function(line) {
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
                } else if (line.substr(0, 12) === 'Encrypted = ') {
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
        .then(function() {
            return resolve(spec);
        })

        // Catch the error and pass it to the reject function of the Promise.
        .catch(function(err) {
            return reject(err);
        });

    });
};