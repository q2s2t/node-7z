'use strict';
var Api = require('../index');
var expect = require('chai').expect;
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');

describe('The Api object', function () {
  
  after(function () {
    rimraf.sync('.tmp/test');
  });
  
  it('should respond to events methods', function () {
    var api = new Api();
    expect(api).to.respondTo('emit');
    expect(api).to.respondTo('on');
  });
  
  it('should have `7z` as default name', function () {
    var api = new Api();
    expect(api.name).to.eql('7z');
  });
  
  it('should be nameable', function () {
    var api = new Api('testName');
    expect(api.name).to.eql('testName');
  });

});

describe('`test` function', function(){

  it('should get an error when 7z gets an error', function (done) {
    var api = new Api();
    api.test('test/nothere.7z', function (err) {
      expect(err.message.substr(0, 14)).to.eql('Command failed');
      done();
    });
  });

  it('should get a list of files and directories', function (done) {
    var api = new Api();
    api.test('test/zip.7z', function (err, files) {
      expect(files.length).to.be.at.least(6);
      done();
    });
  });
  
  it('should be compatible with Promise', function (done) {
    var api = new Api();
    api.test('test/zip.7z').then(function (files) {
      expect(files.length).to.be.at.least(6);
      done();
    });
  });

});

describe('`extract` function', function() {

  it('should get an error when 7z gets an error', function (done) {
    var api = new Api();
    api.extract('test/nothere.7z', '.tmp/test', function (err) {
      expect(err.message).to.contain('archive');
      done();
    });
  });
  
  it('should get a list of files and directories', function (done) {
    var api = new Api();
    api.on('data', function (files) {
      expect(files).to.be.an('array');
      done();
    });
    api.extract('test/zip.7z', '.tmp/test', function () {});
  }); 
  
  it('should get no error on success', function (done) {
    var api = new Api();
    api.extract('test/zip.7z', '.tmp/test', function (err) {
      var file = path.resolve('.tmp/test/zip/file1.txt');
      expect(fs.existsSync(file)).to.eql(true);
      expect(err).to.eql(null);
      done();
    });
  });
  
  it('should be compatible with Promise', function (done) {
    var api = new Api();
    api.extract('test/nothere.7z', '.tmp/test').then(null, function (err) {
      expect(err.message).to.contain('archive');
      done();
    });
  });

});
