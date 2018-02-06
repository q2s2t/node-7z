/*global describe, it */
'use strict';
var expect   = require('chai').expect;
var exec = require('child_process').execSync;
var path = require('../../util/path');

describe('Utility: `path`', function () {

  it('should return deflaut flags with no args', function () {   
    var _7zcmd = path();
    var pathInSystem = exec('which ' + _7zcmd).toString();
  });
	
});