'use strict';
var path  = require('path');

module.exports = function (options) {
  
  // Create a string that can be parsed by `run`.
  try {
    
    if (options.path) {
      return options.path;
    } else {    
      var macversion = (process.platform == "darwin") ? require('macos-release').version : '';
      var binarypath = path.join(__dirname, '..','binaries', (macversion=='') ? process.platform : process.platform, macversion);
      return path.join(binarypath, process.platform === "win32" ? '7za.exe' : '7za');
    }
    
  } catch (e) {
    throw new Error('Path to the 7-Zip bin not found');
  }
  
};