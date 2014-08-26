/*global describe, it, afterEach */
var expect = require('chai').expect;
var fs = require('fs-extra');
var del = require('../lib/delete');

describe('Method: `Zip.delete`', function () {
  
  afterEach(function () { fs.removeSync('.tmp/test'); });
  
  it('should return an error on 7z error', function (done) {
    del('.tmp/test/addnot.7z', '.tmp/test/nothere', { '???': true })
    .catch(function (err) {
      expect(err).to.be.an.instanceof(Error);
      done();
    });
  });
  
  it('should return on fulfillment', function (done) {
    fs.copySync('test/zip.7z', '.tmp/test/copy.7z');
    del('.tmp/test/copy.7z', '*.txt')
    .then(function () {
      done();
    });
  });
  
});
