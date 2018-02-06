'use strict';
var path  = require('path');

module.exports = function (options) {
    
    var macversion = (process.platform == "darwin") ? require('macos-release').version : '';
    var binarypath = path.resolve(__dirname, '..','binaries', (macversion=='') ? process.platform : process.platform, macversion);
    
  // Create a string that can be parsed by `run`.
  try {    
      
    if (options.path) {
      return options.path;
    } else {
      return path.join(binarypath, process.platform === "win32" ? '7za.exe' : '7za');
    }
    
  } catch (e) {
    return path.join(binarypath, process.platform === "win32" ? '7za.exe' : '7za');
  }
  
};