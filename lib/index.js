'use strict';

var Zip = function () {};

Zip.prototype.add = require('./add');
Zip.prototype.extract = require('./extract');
Zip.prototype.extractFull = require('./extractFull');
Zip.prototype.list = require('./list');
Zip.prototype.test = require('./test');

module.exports = Zip;
