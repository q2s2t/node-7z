/*global describe, it */
'use strict';
var expect      = require('chai').expect;
var fs          = require('fs-extra');
var extractFull = require('../../lib/extractFull');

describe('Method: `Zip.extractFull`', function () {

  it('should return an error on 7z error', function (done) {
    extractFull('test/nothere.7z', '.tmp/test')
    .catch(function (err) {
      expect(err).to.be.an.instanceof(Error);
      done();
    });
  });

  it('should return an error on output duplicate', function (done) {
    extractFull('test/zip.7z', '.tmp/test', { o: '.tmp/test/duplicate' })
    .catch(function (err) {
      expect(err).to.be.an.instanceof(Error);
      done();
    });
  });

  it('should return entries on progress', function (done) {
    extractFull('test/zip.7z', '.tmp/test')
    .progress(function (entries) {
      expect(entries.length).to.be.at.least(1);
      done();
    });
  });

  it('should extract on the right path', function (done) {
    extractFull('test/zip.7z', '.tmp/test')
    .then(function () {
      expect(fs.existsSync('.tmp/test/zip')).to.be.eql(true);
      done();
    });
  });

  it('should extract only given wilcards', function (done) {
    extractFull('test/wildcards.zip', '.tmp/test/', { wildcards: ['*.txt'], r: true })
    .progress(function (files) {
      files.forEach(function (f) {
        expect(f).to.include('.txt');
      });
    })
    .then(function () {
      done();
    })
    .catch(function (err) {
      done(err);
    });
  });

  it('should work with spaces in archive name', function (done) {
    extractFull('test/zip spaces test.7z', '.tmp/test spaces one')
    .then(function () {
      expect(fs.existsSync('.tmp/test spaces one/zip')).to.be.eql(true);
      done();
    });
  });

  it('should work with spaces in destination', function (done) {
    extractFull('test/zip.7z', '.tmp/test spaces agai n')
    .then(function () {
      expect(fs.existsSync('.tmp/test spaces agai n/zip')).to.be.eql(true);
      done();
    });
  });

  it('should work with spaces in both source and destination', function (done) {
    /*jshint maxlen:false*/
    fs.copySync('test/zip.7z','.tmp/test/Folder From/Folder A/Folder B/Folder C/zip file.7z');
    extractFull('.tmp/test/Folder From/Folder A/Folder B/Folder C/zip file.7z','.tmp/test/Folder To/Folder D/Folder E/Folder F')
    .then(function () {
      expect(fs.existsSync('.tmp/test/Folder To/Folder D/Folder E/Folder F/zip')).to.be.eql(true);
      done();
    });
  });

});
