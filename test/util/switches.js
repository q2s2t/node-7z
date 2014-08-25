/*global describe, it */
var expect = require('chai').expect;
var switches = require('../../util/switches');

describe('Util: `switches`', function () {
  
  it('should return deflaut flags with no args', function () {
    expect(switches({})).to.eql('-ssc -y');
  });  
  
  it('should return -ssc with flag { ssc: true }', function () {
    expect(switches({ ssc: true })).to.eql('-ssc -y');
  });  
  
  it('should return -ssc- with flag { ssc: false }', function () {
    expect(switches({ ssc: false })).to.eql('-ssc- -y');
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
      m   : '0=BCJ -m1=LZMA:d=21'
    });
    expect(r).to.contain('-ssc');
    expect(r).to.contain('-ssw');
    expect(r).to.contain('m0=BCJ -m1=LZMA:d=21');
    expect(r).to.contain('-y');
  });
  
});