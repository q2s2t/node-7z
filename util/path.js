'use strict';
var path = require("path");
	
module.exports = function (options) {
    
  // Create a string that can be parsed by `run`.
  try {    
      
    if (options.path) return options.path;
	else {
		
		try var macosversion = (process.platform == "darwin") ? require('macos-release').version : '';
		catch (e) var macosversion = '';
		
		var binarypath = path.join(__dirname, "..","binaries", (macosversion == '') ? process.platform : process.platform, macosversion );
		var binaryfilename = (process.platform == "win32") ? '7za.exe' : '7za';
		return { path: binarypath, 
			filename: binaryfilename, 
			fullpath: path.join(binarypath, binaryfilename) }
	}    
  } catch (e) {
	  
	try var macosversion = (process.platform == "darwin") ? require('macos-release').version : '';
	catch (e) var macosversion = '';
	
    var binarypath = path.join(__dirname, "..","binaries", (macosversion == '') ? process.platform : process.platform, macosversion );
    var binaryfilename = (process.platform == "win32") ? '7za.exe' : '7za';
    return { path: binarypath, 
		filename: binaryfilename, 
		fullpath: path.join(binarypath, binaryfilename) }
  }
  
};