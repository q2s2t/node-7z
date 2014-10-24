/*global describe, it */
'use strict';
var expect = require('chai').expect;
var files  = require('../../util/files');

describe('Utility: `files`', function () {

  it('should error on invalid files', function () {
    var r = files();
    expect(r).to.eql('');
  });

  it('should works with strings', function () {
    var r = files('hello test');
    expect(r).to.eql('"hello test"');
  });

  it('should works with arrays', function () {
    var r = files([ 'hello test', 'hello world' ]);
    expect(r).to.eql('"hello test" "hello world"');
  });

});
