/*global describe, it, afterEach */
var expect = require('chai').expect;
var fs = require('fs');
var rimraf = require('rimraf');
var add = require('../lib/add');

describe('Method: `Zip.add`', function () {
  
  afterEach(function () { rimraf.sync('.tmp/test'); });
  
  it('should return an error on 7z error', function (done) {
    add('.tmp/test/addnot.7z', '.tmp/test/nothere', { '???': true })
    .catch(function (err) {
      expect(err).to.be.an.instanceof(Error);
      done();
    });
  });
  
  it('should return entries on progress', function (done) {
    add('.tmp/test/add.7z', '*.md')
    .progress(function (entries) {
      expect(entries.length).to.be.at.least(1);
      done();
    });
  });
  
});
