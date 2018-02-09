'use strict';

module.exports = function (options) {
        
  // Create a string that can be parsed by `run`.
  try {    
      
    if (options.path) return options.path;
    
  } catch (e) {
    var path = require('path');
    var macversion = (process.platform == "darwin") ? require('macos-release').version : '';
    var binarypath = path.resolve(__dirname, '..','binaries', (macversion=='') ? process.platform : process.platform, macversion);
    return path.join(binarypath, process.platform === "win32" ? '7za.exe' : '7za');
  }
  
};