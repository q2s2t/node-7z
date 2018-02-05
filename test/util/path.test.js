/*global describe, it */
'use strict';
var expect   = require('chai').expect;
var exec = require('child_process').execSync;
var path = require('../../util/path');
var path = require('path');

describe('Utility: `path`', function () {

    // add platform binary to environment path
    var envPath = process.env.path;
    var macos = (process.platform == "darwin") ? require('macos-release').version : '';
    var pathto7z = path.join(__dirname, "..","..","binaries", macos == '' ? process.platform : process.platform, macos );  
    if (envPath.indexOf('7za') < 0) {
        process.env.path += (envPath[envPath.length -1] === ';') ? pathto7z : ';' + pathto7z;
    }
    
  it('should return deflaut flags with no args', function () {
    var pathInSystem = exec('which 7za').toString();
  });
	
});