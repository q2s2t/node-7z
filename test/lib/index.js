/*global describe, it */
var expect = require('chai').expect;
var Zip = require('../../lib');

describe('Class: `Zip`', function () {
  
  it('should be instanciable', function () {
    var zip = new Zip();
    expect(zip).to.respondTo('extract');
    expect(zip).to.respondTo('extractFull');
    expect(zip).to.respondTo('list');
    expect(zip).to.respondTo('test');
  });
  
});
