/*global afterEach */
'use strict';
var fs = require('fs-extra');

// Remove the `.tmp/` directory after each test.
afterEach(function () {
  fs.removeSync('.tmp/');
});
