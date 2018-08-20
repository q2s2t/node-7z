'use strict';

var Zip = function () {};

Zip.prototype.add = require('./add');
Zip.prototype.addOne = require('./addOne');
Zip.prototype.delete = require('./delete');
Zip.prototype.extract = require('./extract');
Zip.prototype.extractFull = require('./extractFull');
Zip.prototype.extractOne = require('./extractOne');
Zip.prototype.list = require('./list');
Zip.prototype.test = require('./test');
Zip.prototype.update = require('./update');
Zip.prototype.binary = require('../util/path');

module.exports = Zip;
