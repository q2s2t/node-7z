'use strict';
var path = require("path");
	
module.exports = function (options) {
	try { var macosversion = (process.platform == "darwin") ? require('macos-release').version : ''; }
	catch (e) { var macosversion = 'undefined' }
	
	var type = typeof options;	
	if ((options) && (type == "object") && ((options.hasOwnProperty('path'))) return options.path;  
	else {		
		var binarypath = path.join(__dirname, "..","binaries", (macosversion == '') ? process.platform : process.platform + path.sep + macosversion );
		var binaryfilename = (process.platform == "win32") ? '7za.exe' : '7za'; 
		return { path: binarypath, 
			filename: binaryfilename, 
			fullpath: path.join(binarypath, binaryfilename) }
	}  
};