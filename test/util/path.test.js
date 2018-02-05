/*global describe, it */
'use strict';
var expect   = require('chai').expect;
var exec = require('child_process').execSync;
var path = require('../../util/path');

describe('Utility: `path`', function () {

  it('should return deflaut flags with no args', function () {
    var pathInSystem = exec('which 7z').toString();
  });
	
});