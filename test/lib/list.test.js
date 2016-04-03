/*global describe, it */
'use strict';
var expect = require('chai').expect;
var list   = require('../../lib/list');

describe('Method: `Zip.list`', function () {

  it('should return an error on 7z error', function (done) {
    list('test/nothere.7z')
    .catch(function (err) {
      expect(err).to.be.an.instanceof(Error);
      done();
    });
  });

  it('should return an tech spec on fulfill', function (done) {
    list('test/zip.7z', { r: true })
    .then(function (spec) {
      expect(spec).to.have.property('path');
      expect(spec).to.have.property('type');
      expect(spec).to.have.property('method');
      expect(spec).to.have.property('physicalSize');
      expect(spec).to.have.property('headersSize');
      done();
    });
  });

  it('should return valid entries on progress', function (done) {
    list('test/zip.zip')
    .progress(function (entries) {
      expect(entries.length).to.be.at.least(1);
      expect(entries[0].date).to.be.an.instanceof(Date);
      expect(entries[0].attr.length).to.eql(5);
      expect(entries[0].name).to.be.a('string');
      expect(entries[0].name).to.not.contain('\\');
      done();
    });
  });

  it('should not ignore files with blank "Compressed" columns', function (done) {
    list('test/blank-compressed.7z')
    .progress(function (files) {
      expect(files.length).to.be.eql(8);
      done();
    });
  });

  it('should not ignore read-only, hidden and system files', function () {
    var files = [];
    return list('test/attr.7z').progress(function (chunk) {
      [].push.apply(files, chunk);
    }).then(function () {
      expect(files.length).to.be.eql(9);
    });
  });

});
