/*global describe, it */
var expect = require('chai').expect;
var run = require('../../util/run');

describe('Util: `run`', function () {
  
  it('should return an error with invalid command type', function (done) {
    run(0).catch(function (err) {
      expect(err.message).to.eql('Command must be a string');
      done();
    });
  });
  
  it('should return an error on when 7z gets one', function (done) {
    run('7z ?').catch(function (err) {
      expect(err.message).to.eql('Incorrect command line');
      done();
    });
  });
  
  it('should return an stdout on progress', function (done) {
    run('7z')
    .progress(function (data) {
      expect(data).to.be.a('string');
    })
    .then(function () {
      done();
    });
  });
  
});