'use strict';
var os    = require('os');
var spawn = require('win-spawn');
var when  = require('when');

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
