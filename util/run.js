'use strict';
var os    = require('os');
var spawn = require('win-spawn');
var Q     = require('q');

/**
 * @function run
 * @param {string} command The command to run
 */
module.exports = function (command, cb) {
  return Q.Promise(function (resolve, reject, notify) {
    
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
    // error's message. Otherwise progress with the processed files and 
    // directories as an array.
    var err;
    var reg = new RegExp('Error:' + os.EOL + '(.*)', 'g');
    var run = spawn(cmd, args, { stdio: 'pipe' });
    run.stdout.on('data', function (data) {
      var res = reg.exec(data.toString());
      if (res) {
        err = new Error(res[1]);
      }
      notify(data.toString());
    });
    run.on('close', function (code) {
      if (code === 0) return resolve();
      reject(err);
    });
    
  }).nodeify(cb);
};
