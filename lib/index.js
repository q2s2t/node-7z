'use strict';

var Zip = function () {};

Zip.prototype.test = require('./test');
Zip.prototype.extract = require('./extract');
Zip.prototype.extractFull = require('./extractFull');

module.exports = Zip;
