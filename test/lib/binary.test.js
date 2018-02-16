/*global describe, it */
'use strict';
var expect   = require('chai').expect;
var binary = require('../../util/path');

describe('Method: `Zip.binary`', function () {
    var _7zcmd = binary();
    
    it('should return an object', function (done) {
        expect(_7zcmd).to.be.an('object');
        done();
    });      
   
    it('should return an object with key fields of `path, filename, fullpath` and be string', function (done) {
		expect(_7zcmd).to.have.property('path');
		expect(_7zcmd).to.have.property('filename');
		expect(_7zcmd).to.have.property('fullpath');
		expect(_7zcmd.fullpath).to.be.a('string');
        done();
    });  
  
    it('should return an string from `object` with correct key { path: 7za } ', function (done) {
        var _7zpath = binary({ path: '7za' });
        expect(_7zpath).to.be.a('string');
        done();
    });
	
    it('should return an object from `object` with wrong key or no key', function (done) {
        var _7zpathwrong = binary({ nopath: '7za' });
        expect(_7zpathwrong).to.be.an('object');
        var _7zpathno = binary('???');
        expect(_7zpathno).to.be.an('object');
        done();
    });		
});



describe('Method: `Zip.binary` with platform set to `darwin`', function () {
	    // save original process.platform    
    before(function() { this.originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
    // redefine process.platform
        Object.defineProperty(process, 'platform', { value: 'darwin' }); });
    // restore original process.platform
    after(function() { Object.defineProperty(process, 'platform', this.originalPlatform); });
	
    var _7zcmdmac = binary();
    
    it('should return an object', function (done) {
        expect(_7zcmdmac).to.be.an('object');
        done();
    });      
   
    it('should return an object with key fields of `path, filename, fullpath` and be string', function (done) {
		expect(_7zcmdmac).to.have.property('path');
		expect(_7zcmdmac).to.have.property('filename');
		expect(_7zcmdmac).to.have.property('fullpath');
		expect(_7zcmdmac.fullpath).to.be.a('string');
        done();
    });  
  
    it('should return an string from `object` with correct key { path: 7za } ', function (done) {
        var _7zpathmac = binary({ path: '7za' });
        expect(_7zpathmac).to.be.a('string');
        done();
    });
	
    it('should return an object from `object` with wrong key or no key', function (done) {
        var _7zpathmacwrong = binary({ nopath: '7za' });
        expect(_7zpathmacwrong).to.be.an('object');
        var _7zpathmacno = binary('???');
        expect(_7zpathmacno).to.be.an('object');
        done();
    });		
});


