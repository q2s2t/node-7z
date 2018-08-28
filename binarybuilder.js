#!/usr/bin/env node
'use strict'

const fs = require('fs-extra'); 
const path = require('path');
const decompress = require('inly');
const spawn = require('cross-spawn');
const uncompress = require('all-unpacker');
const node_wget = require('node-wget');
const retryPromise = require('retrying-promise'); 

const _7zipData = getDataForPlatform();
const whattocopy = _7zipData.binaryfiles;

const _7zAppfile = '7z1604-extra.7z';
const _7zApptocopy = [ '7za.dll','7za.exe','7zxa.dll' ];
const _7zAppurl = 'http://7-zip.org/a/';

const platform = 'darwin';
const cwd = process.cwd();
const destination = path.join(cwd, platform);
// Will use P7zip 16.02 if installer find Mac OS is 10.11 or higher 
const downloadandcopy = [ '10.11', '10.10', '10.9', '10.8', '10.7', '10.6' ];

var retrytime = [];
    
if (_7zipData.url != null) {
    fs.mkdir(destination, (err) => { if (err) {}});
    platformUnpacker(destination)
    .then(function (mode) {
        if (mode='done') {
            var whattodelete = _7zApptocopy.concat([ _7zAppfile]);
                whattodelete.forEach(function (s) { fs.unlink(path.join(cwd, s), (err) => { if (err) console.error(err); }); });
            fs.remove(destination, (err) => { if (err) console.error(err); });
            console.log('Binaries copied successfully!');
        }   
    })
    .catch(function (err) { console.log(err); });    
}
 
function getDataForPlatform(){
    switch (process.platform) {
        // Using Windows to extract Mac version binaries
        case "win32": return { 
            url: [ 'https://raw.githubusercontent.com/rudix-mac/packages/master/', 'https://raw.githubusercontent.com/rudix-mac/pkg/master/' ],
            filename: [ 'p7zip-9.20.1-1.pkg', 'p7zip-16.02.pkg' ],
            extractfolder: '',
            applocation: 'usr/local/lib/p7zip',
            binaryfiles: [ '7z','7z.so','7za','7zCon.sfx','7zr','Codecs' ]//,
            //sfxmodules: [ '7zS.sfx','7zS2.sfx','7zS2con.sfx','7zSD.sfx' ] 
        };
    }
}

function wget(path) {
  console.log('Downloading ' + path.url);
  return new Promise(function (resolve, reject) {
    node_wget(path, function (err) {
      if (err) {
        console.error('Error downloading file: ' + err);
        return reject(err);
      }
      resolve();
    });
  });
}

function platformUnpacker(destination){
  return new retryPromise(function (resolve, retry, reject) {       
        wget({ url: _7zAppurl + _7zAppfile, dest: path.join(cwd,_7zAppfile) })     
        .then(function () { 
                console.log('Extracting: ' + _7zAppfile + ', to decompress: ' + _7zipData.filename[0] + ' and ' +_7zipData.filename[1]);
                unpack(path.join(cwd, _7zAppfile), cwd, _7zApptocopy)
                .then(function() {  
                    var response = [];
                    var geturl = '';
                    var getfilename = '';
                    var source = '';
                    downloadandcopy.forEach(function(macos, index) {
                        geturl = (macos != '10.11') ? _7zipData.url[0] + macos + '/' : _7zipData.url[1];
                        getfilename = (macos != '10.11') ? _7zipData.filename[0] : _7zipData.filename[1];
                        
                        fs.mkdir(path.join(destination,macos), (err) => { if (err) {} });
                        source = path.join(destination,macos, getfilename); 
                        console.log('Downloading ' + geturl + getfilename);                      
                        node_wget({ url: geturl + getfilename, dest: source}, function (err) { 
                            if (err) { console.error('Error downloading file: ' + err); return reject(err); }                          
                            response.push(index);
                            if(response.length === downloadandcopy.length) {
                                binaryextractor(destination)
                                .then(function(result) {  
                                    if (result=='extractor done') resolve('done');
                                })
                                .catch(function (err) { 
                                    retrytime.push(err);
                                    if ( retrytime.length === downloadandcopy.length ) reject(err);
                                    else retry();                                     
                                }); 
                            }
                        });
                    });            
                }).catch(function (err) { 
                                    retrytime.push(err);
                                    if ( retrytime.length === downloadandcopy.length ) reject(err);
                                    else retry();                                     
                                }); 
            
        }).catch(function (err) { 
                                    retrytime.push(err);
                                    if ( retrytime.length === downloadandcopy.length ) reject(err);
                                    else retry();                                     
                                });
  });  
}


function unpack(source, destination, tocopy) {
  return new Promise(function (resolve, reject) {
    uncompress.unpack(source, {  files: (tocopy==null) ? '' : tocopy,  
        targetDir: destination, forceOverwrite: true, noDirectory: true, copyTime: true },
          function(err, files, text) {
            if (err) return reject(err);
            if (text) {
                // console.log(text);
                resolve(text);
            }
        }); 
    });
}

function macunpack(source, destination, macos){
     var cmd = '7za.exe';
     var args = [ 'x',source,'-o' + destination,'-y'];
     console.log('Running: ' + cmd);
  return new Promise(function (resolve, reject) {
    var winunpacker = spawn.sync(cmd, args, { stdio: 'pipe' });     
        if (winunpacker.error) {
          console.error('7za exited with code ' + winunpacker.error);
          console.log('resolve the problem and re-install using:');
          console.log('npm install');
          return reject(winunpacker.error);
        }  
        if (winunpacker.stdout.toString()) {
            var macpayload = (macos != '10.11') ? 'p7zip-9.20.1-1' : 'p7zip-16.02';
            console.log('Decompressing: ' + macpayload); 
            unpack(path.join(destination, macpayload), platform + path.sep + macos, _7zipData.applocation + '/*')
            .then(function() { 
                whattocopy.forEach(function(s) { 
                    fs.moveSync(path.join(destination, _7zipData.extractfolder, _7zipData.applocation,s), path.join(__dirname,'binaries',platform, macos,s), { overwrite: true }); });
                resolve();
            }).catch(function (err) { reject(err); });
        } 
    });
}

function binaryextractor(destination) {
    var response = [];
    var zipfilename = '';
    var source = '';
  return new Promise(function (resolve, reject) { 
        downloadandcopy.forEach(function(macos, index) {  
            zipfilename = (macos != '10.11') ? _7zipData.filename[0] : _7zipData.filename[1];
            console.log('Decompressing Mac ' + macos + ' OS of ' + zipfilename); 
            source = path.join(destination, macos, zipfilename); 
            macunpack(source, path.join(destination, macos), macos)
            .then(function() {
                response.push(index);
                if(response.length === downloadandcopy.length) resolve('extractor done');
            }).catch(function (err) { reject(err); }); 
        });  
    });
}
