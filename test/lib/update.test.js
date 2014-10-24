/*global describe, it */
'use strict';
var expect = require('chai').expect;
var fs     = require('fs-extra');
var update = require('../../lib/update');

describe('Method: `Zip.update`', function () {

  it('should return an error on 7z error', function (done) {
    update('.tmp/test/addnot.7z', '.tmp/test/nothere', { '???': true })
    .catch(function (err) {
      expect(err).to.be.an.instanceof(Error);
      done();
    });
  });

  it('should return entries on progress', function (done) {
    fs.copySync('test/zip.7z', '.tmp/test/update.7z');
    update('.tmp/test/update.7z', '*.md', { w: 'test' })
    .progress(function (entries) {
      expect(entries.length).to.be.at.least(1);
      done();
    });
  });

  it('should return on fulfillment', function (done) {
    fs.copySync('test/zip.7z', '.tmp/test/update.7z');
    update('.tmp/test/update.7z', '*.txt')
    .then(function () {
      done();
    });
  });

});
