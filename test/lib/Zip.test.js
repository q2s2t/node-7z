/*global describe, it */
'use strict';
var expect = require('chai').expect;
var Zip    = require('../../lib');

describe('Class: `Zip`', function () {

  it('should be a class', function () {
    var zip = new Zip();
    expect(zip).to.be.an.instanceof(Zip);
  });

  it('should respond to 7-Zip commands as methods', function () {
    var zip = new Zip();
    expect(zip).to.respondTo('add');
    expect(zip).to.respondTo('delete');
    expect(zip).to.respondTo('extract');
    expect(zip).to.respondTo('extractFull');
    expect(zip).to.respondTo('list');
    expect(zip).to.respondTo('test');
    expect(zip).to.respondTo('update');
  });

});
