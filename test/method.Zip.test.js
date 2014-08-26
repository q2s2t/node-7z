/*global describe, it, afterEach */
var expect = require('chai').expect;
var fs = require('fs');
var rimraf = require('rimraf');
var test = require('../lib/test');

describe('Method: `Zip.test`', function () {
  
  afterEach(function () { rimraf.sync('.tmp/test'); });
  
  it('should return an error on 7z error', function (done) {
    test('test/nothere.7z')
    .catch(function (err) {
      expect(err).to.be.an.instanceof(Error);
      done();
    });
  });
  
  it('should return entries on progress', function (done) {
    test('test/zip.7z', { r: true })
    .progress(function (entries) {
      expect(entries.length).to.be.at.least(1);
      done();
    });
  });
  
});