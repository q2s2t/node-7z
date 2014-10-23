/*global describe, it */
var expect = require('chai').expect;
var run = require('../util/run');

describe('Utility: `run`', function () {

  it('should return an error with invalid command type', function (done) {
    run(0).catch(function (err) {
      expect(err.message).to.eql('Command must be a string');
      done();
    });
  });

  it('should return an error on when 7z gets one', function (done) {
    run('7za "???"').catch(function (err) {
      expect(err.message).to.eql('Incorrect command line');
      done();
    });
  });

  it('should return an stdout on progress', function (done) {
    run('7za', { h: true })
    .progress(function (data) {
      expect(data).to.be.a('string');
    })
    .then(function () {
      done();
    });
  });

  it('should correctly parse complex commands', function (done) {
    run('7za a ".tmp/test/archive.7z" "*.exe" "*.dll"', {
      m0: '=BCJ',
      m1: '=LZMA:d=21'
    })
    .then(function (res) {
      expect(res.args).to.eql([
        'a',
        '.tmp/test/archive.7z',
        '*.exe',
        '*.dll',
        '-m0=BCJ',
        '-m1=LZMA:d=21',
        '-ssc',
        '-y',
      ]);
      done();
    });
  });

  it('should correctly parse complex commands with spaces', function (done) {
    var sep = require('path').sep;
    run('7za a ".tmp/Folder A/Folder B\\archive.7z" "*.exe" "*.dll"', {
      m0: '=BCJ',
      m1: '=LZMA:d=21',
      p : 'My mhjls/\\c $^é5°',
    })
    .then(function (res) {
      expect(res.args).to.eql([
        'a',
        '.tmp/Folder A'+sep+'Folder B'+sep+'archive.7z',
        '*.exe',
        '*.dll',
        '-m0=BCJ',
        '-m1=LZMA:d=21',
        '-p"My mhjls/\\c $^é5°"',
        '-ssc',
        '-y'
      ]);
      done();
    });
  });

});
