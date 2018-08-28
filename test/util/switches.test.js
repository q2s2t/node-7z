/*global describe, it */
'use strict';
var expect   = require('chai').expect;
var switches = require('../../util/switches');

describe('Utility: `switches`', function () {

  it('should return deflaut flags with no args', function () {
    expect(switches({})).to.contain('-ssc');
    expect(switches({})).to.contain('-y');
  });

  it('should return -ssc with flag { ssc: true }', function () {
    expect(switches({ ssc: true })).to.contain('-ssc');
    expect(switches({ ssc: true })).to.contain('-y');
  });

  it('should return -ssc- with flag { ssc: false }', function () {
    expect(switches({ ssc: false })).to.contain('-ssc-');
  });

  it('should return non default booleans when specified', function () {
    var r = switches({
      so : true,
      spl: true,
      ssw: true,
      y  : false
    });
    expect(r).to.contain('-so');
    expect(r).to.contain('-spl');
    expect(r).to.contain('-ssc');
    expect(r).to.contain('-ssw');
    expect(r).not.to.contain('-y');
  });

  it('should return complex values when needed', function () {
    var r = switches({
      ssc : true,
      ssw : true,
      mx0 : true
    });
    expect(r).to.contain('-ssc');
    expect(r).to.contain('-ssw');
    expect(r).to.contain('-mx0');
    expect(r).to.contain('-y');
  });

  it('should return complex values with spaces and quotes', function () {
    var r = switches({
      ssc : true,
      ssw : true,
      m0  : '=BCJ',
      m1  : '=LZMA:d=21',
      p   : 'My Super Pasw,àù£*',
    });
    expect(r).to.contain('-ssc');
    expect(r).to.contain('-ssw');
    expect(r).to.contain('-m0=BCJ');
    expect(r).to.contain('-m1=LZMA:d=21');
    expect(r).to.contain('-p"My Super Pasw,àù£*"');
    expect(r).to.contain('-y');
  });

  it('should works with the `raw` switch', function () {
    var r = switches({
      raw: ['-i!*.jpg', '-i!*.png'],
    });
    expect(r).to.contain('-i!*.jpg');
    expect(r).to.contain('-i!*.png');
  });

});
