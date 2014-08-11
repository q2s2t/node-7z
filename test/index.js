'use strict';
var sevenzip = require('../index');
var expect = require('chai').expect;
var path = require('path');
var fs = require('fs');

describe('`test` function', function(){

  it('should get an error when 7z gets an error', function (done) {
    sevenzip.test('test/resource/nothere.7z')
      .then(null, function (err) {
        expect(err.message.substr(0, 14)).to.eql('Command failed');
        done();
      });
  });

  it('should get a list of files and directories', function (done) {
    sevenzip.test('test/resource/resource.7z')
      .then(function (files) {
        expect(files.length).to.be.at.least(6);
        done();
      });
  });

  it('should be usable as a non-promise function', function (done) {
    sevenzip.testNode('test/resource/resource.7z', function (err, files) {
      expect(files).to.be.an('array');
      done();
    });
  });

});

describe('`extract` function', function() {

  it('should get an error when 7z gets an error', function (done) {
    sevenzip.extract('test/resource/nothere.7z', '.tmp/extract')
      .then(null, function (err) {
        expect(err.message.substr(0, 14)).to.eql('Command failed');
        done();
      });
  });

  it('should get a list of files and directories', function (done) {
    sevenzip.extract('test/resource/resource.7z', '.tmp/extract')
      .then(function (files) {
        var t = path.resolve('.tmp/extract', files[0]);
        expect(fs.existsSync(t)).to.eql(true);
        expect(files.length).to.be.at.least(6);
        done();
      });
  });

  it('should be usable as a non-promise function', function (done) {
    sevenzip.extractNode(
      'test/resource/resource.7z',
      '.tmp/extract',
      function (err, files) {
      expect(files).to.be.an('array');
      done();
    });
  });

});
