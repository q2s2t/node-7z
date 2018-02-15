/*global describe, it */
'use strict';
var expect   = require('chai').expect;
var path = require('../../util/path');

describe('Method: `Zip.binary`', function () {
    var _7zcmd = path();
    
    it('should return an object', function (done) {
        expect(_7zcmd).to.be.an('object');
        done();
    });      
   
    it('should return an object key value of string', function (done) {
        expect(_7zcmd.path).to.be.a('string');
        expect(_7zcmd.filename).to.be.a('string');
        expect(_7zcmd.fullpath).to.be.a('string');
        done();
    });  
  
    it('should return an string from `object` { path: \bin\7za } ', function (done) {
        var pathobject = { path: '\bin\7za' };
        var _7zpath = path(pathobject);
        expect(_7zpath).to.be.a('string');
        done();
    });
	
});
