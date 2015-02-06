'use strict';
var os    = require('os');
var spawn = require('win-spawn');
var when  = require('when');
var path  = require('path');
var utilSwitches = require('./switches');

/**
 * @promise Run
 * @param {string} command The command to run.
 * @param {Array} switches Options for 7-Zip as an array.
 * @progress {string} stdout message.
 * @reject {Error} The error issued by 7-Zip.
 * @reject {number} Exit code issued by 7-Zip.
 */
module.exports = function (command, switches) {
  return when.promise(function (fulfill, reject, progress) {

    // Parse the command variable. If the command is not a string reject the
    // Promise. Otherwise transform the command into two variables: the command
    // name and the arguments.
    if (typeof command !== 'string') {
      return reject(new Error('Command must be a string'));
    }
    var cmd  = command.split(' ')[0];
    var args = [ command.split(' ')[1] ];

    // Parse and add command (non-switches parameters) to `args`.
    var regexpCommands = /"((?:\\.|[^"\\])*)"/g;
    var commands       = command.match(regexpCommands);
    if (commands) {
      commands.forEach(function (c) {
        c = c.replace(/\//, path.sep);
        c = c.replace(/\\/, path.sep);
        c = path.normalize(c);
        args.push(c);
      });
    }

    // Special treatment for the output switch because it is exposed as a
    // parameter in the API and not as a option. Plus wilcards can be passed.
    var regexpOutput = /-o"((?:\\.|[^"\\])*)"/g;
    var output       = command.match(regexpOutput);
    if (output) {
      args.pop();
      var o = output[0];
      o = o.replace(/\//, path.sep);
      o = o.replace(/\\/, path.sep);
      o = o.replace(/"/g, '');
      o = path.normalize(o);
      args.push(o);
    }

    // Add switches to the `args` array.
    var switchesArray = utilSwitches(switches);
    switchesArray.forEach(function (s) { args.push(s); });

    // Remove now double quotes. If present in the spawned process 7-Zip will
    // read them as part of the paths (e.g.: create a `"archive.7z"` with
    // quotes in the file-name);
    args.forEach(function (e, i) {
      if (typeof e !== 'string') {
        return;
      }
      if (e.substr(0, 1) !== '-') {
        e = e.replace(/^"/, '');
        e = e.replace(/"$/, '');
        args[i] = e;
      }
    });

    // When an stdout is emitted, parse it. If an error is detected in the body
    // of the stdout create an new error with the 7-Zip error message as the
    // error's message. Otherwise progress with stdout message.
    var err;
    var reg = new RegExp('Error:' + os.EOL + '?(.*)', 'g');
    var res = {
      cmd: cmd,
      args: args,
      options: { stdio: 'pipe' } };
    // console.log('>>', res.cmd, res.args.join(' '));
    var run = spawn(res.cmd, res.args, res.options);
    run.stdout.on('data', function (data) {
      var res = reg.exec(data.toString());
      if (res) {
        err = new Error(res[1]);
      }
      return progress(data.toString());
    });
    run.on('close', function (code) {
      if (code === 0) {
        return fulfill(args);
      }
      return reject(err, code);
    });

  });
};
