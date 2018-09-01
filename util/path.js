'use strict';
var path = require("path");
	
module.exports = function (options) {
  // Create a string that can be parsed by `run`.   
	var type = typeof options;	
	if ((options) && (type == "object") && (options.hasOwnProperty('path'))) return options.path;  
	else {		
		var binarypath = path.join(__dirname, "..","binaries", process.platform);
		var binaryfilename = (process.platform == "win32") ? '7za.exe' : '7za'; 
		return { path: binarypath, 
			filename: binaryfilename, 
			fullpath: path.join(binarypath, binaryfilename) 
			}
	}  
};