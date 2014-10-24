/*global describe, it */
'use strict';
var expect  = require('chai').expect;
var fs      = require('fs-extra');
var del     = require('../../lib/delete');
var extract = require('../../lib/extractFull');

describe('Method: `Zip.delete`', function () {

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

  it('should accept array as source', function (done) {
    fs.copySync('test/zip.7z', '.tmp/d.7z');
    del('.tmp/d.7z', [
      'zip/file0.txt',
      'zip/file1.txt',
    ])
    .then(function () {
      extract('.tmp/d.7z', '.tmp/d').then(function () {
        var files = fs.readdirSync('.tmp/d/zip');
        expect(files).not.to.contain('file0.txt');
        expect(files).not.to.contain('file1.txt');
        expect(files).to.contain('file2.txt');
        expect(files).to.contain('folder');
        done();
      });
    });
  });

});
