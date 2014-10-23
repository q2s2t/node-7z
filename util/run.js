'use strict';
var os    = require('os');
var spawn = require('win-spawn');
var when  = require('when');
var path  = require('path');

/**
 * @promise Run
 * @param {string} command The command to run.
 * @progress {string} stdout message.
 * @reject {Error} The error issued by 7-Zip.
 * @reject {number} Exit code issued by 7-Zip.
 */
module.exports = function (command) {
  return when.promise(function (fulfill, reject, progress) {

    // Parse the command variable. If the command is not a string reject the
    // Promise. Otherwise transform the command into two variables: the command
    // name and the arguments.
    if (typeof command !== 'string') {
      return reject(new Error('Command must be a string'));
    }
    var args = command.split(' ');
    var cmd  = args[0];
    args.shift();

    // Recover pathes when the have spaces. The split process above didn't care
    // if the string contains pathes with spaces. The loop bellow look for each
    // item to have a escape char at the end, if is present concat with the next
    // item to restore the original path.
    var filterSpaces = function (elem, index, array) {
      if (elem[elem.length - 1] === '\\') {
        var firstPart = elem.substr(0, elem.length - 1);
        var separator = ' ';
        var lastPart  = args[index + 1];
        args[index] = firstPart + separator + lastPart;
        args.splice(index + 1, 1);
      }
    };

    // Run the filter for each space. By splicing the array in the function 
    // above the filter does not run on the item just after one that is being 
    // removed.
    for (var i = 0; i < args.length; i++) {
      args.forEach(filterSpaces);
    }
    
    // Normalize pathes before passing them to 7-Zip.
    args[1] = path.normalize(args[1]);
    args[2] = path.normalize(args[2]);
    
    // When an stdout is emitted, parse it. If an error is detected in the body
    // of the stdout create an new error with the 7-Zip error message as the
    // error's message. Otherwise progress with stdout message.
    var err;
    var reg = new RegExp('Error:' + os.EOL + '?(.*)', 'g');
    var run = spawn(cmd, args, { stdio: 'pipe' });
    run.stdout.on('data', function (data) {
      var res = reg.exec(data.toString());
      if (res) {
        err = new Error(res[1]);
      }
      progress(data.toString());
    });
    run.on('close', function (code) {
      if (code === 0) return fulfill();
      reject(err, code);
    });

  });
};
