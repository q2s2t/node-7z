'use strict';

var Zip = function () {};

Zip.prototype.add = require('./add');
Zip.prototype.delete = require('./delete');
Zip.prototype.extract = require('./extract');
Zip.prototype.extractFull = require('./extractFull');
Zip.prototype.list = require('./list');
Zip.prototype.test = require('./test');
Zip.prototype.update = require('./update');

module.exports = Zip;

if (process.platform !== "win32") {
    var Path = require("path");
    var macosversion = (process.platform == "darwin") ? require('macos-release').version : '';
    var binarypath = Path.join(__dirname, "..","binaries", macosversion == '' ? process.platform : process.platform, macosversion );
    require("fs").chmodSync(Path.join(binarypath, '7za'), 755);
} 
