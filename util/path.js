'use strict';
var path = require("path");
	
module.exports = function (options) {
  // Create a string that can be parsed by `run`.
	try { 
		var appleos = (process.platform == "darwin") ? require('macos-release').version : ''; 
	}	
	catch (e) { 
		var appleos = 'undefined';
	}

    var versionCompare = function(left, right) {
        if (typeof left + typeof right != 'stringstring')
            return false;
        
        var a = left.split('.');
        var b = right.split('.');
        var i = 0;
        var len = Math.max(a.length, b.length);
            
        for (; i < len; i++) {
            if ((a[i] && !b[i] && parseInt(a[i]) > 0) || (parseInt(a[i]) > parseInt(b[i]))) {
                return 1;
            } else if ((b[i] && !a[i] && parseInt(b[i]) > 0) || (parseInt(a[i]) < parseInt(b[i]))) {
                return -1;
            }
        }
        
        return 0;
    }	
    
    var macosversion = ((appleos=='') || (appleos=='undefined')) ? appleos : ((versionCompare(appleos, '10.11') == -1) ? appleos : '10.11');
	var type = typeof options;	
	if ((options) && (type == "object") && (options.hasOwnProperty('path'))) return options.path;  
	else {		
		var binarypath = path.join(__dirname, "..","binaries", (macosversion == '') ? process.platform : process.platform + path.sep + macosversion );
		var binaryfilename = (process.platform == "win32") ? '7za.exe' : '7za'; 
		return { path: binarypath, 
			filename: binaryfilename, 
			fullpath: path.join(binarypath, binaryfilename) 
			}
	}  
};