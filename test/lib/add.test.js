/*global describe, it */
'use strict';
var expect = require('chai').expect;
var exec = require('child_process').execSync;
var add = require('../../lib/add');
var path = require('../../util/path');
var _7zcmd = path();

describe('Method: `Zip.add`', function() {

  it('should return entries on progress', function(done) {
    add('.tmp/test/add.zip', '*.md')
    .progress(function(entries) {
      expect(entries.length).to.be.at.least(1);
      done();
    })
    .catch(function (err) {
      done();
    });
  });

  it('should accept array as source', function(done) {
    var store = [];
    add('.tmp/test/add.zip', ['*.md', '*.js'])
    .progress(function(entries) {
      entries.forEach(function (e) {
        store.push(e);
      });
    })
    .done(function() {
      expect(store.length).to.be.at.least(4);
      done();
    });
  });

});
