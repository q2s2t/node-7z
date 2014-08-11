'use strict';
var sevenzip = require('../index');
var expect = require('chai').expect;

describe('Specifications for the `test` function', function(){

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

});
