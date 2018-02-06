#!/usr/bin/env node
'use strict'

const fs = require('fs-extra'); 
const path = require('path');
const decompress = require('inly');
const spawn = require('cross-spawn');
const uncompress = require('unpack-all');
const node_wget = require('node-wget');
const retryPromise = require('retrying-promise'); 

const _7zipData = getDataForPlatform();
const whattocopy = _7zipData.binaryfiles;

const _7zAppfile = '7z1604-extra.7z';
const _7zApptocopy = [ '7za.dll','7za.exe','7zxa.dll' ];
const _7zAppurl = 'http://7-zip.org/a/';

const unarAppfile = 'unar1.8.1_win.zip';
const unarApptocopy = [ 'lsar.exe','unar.exe','Foundation.1.0.dll' ];
const unarAppurl = 'https://storage.googleapis.com/google-code-archive-downloads/v2/code.google.com/theunarchiver/';

const platform = 'darwin';
const cwd = process.cwd();
const destination = path.join(cwd, platform);
const downloadandcopy = [ '10.12', '10.11', '10.10', '10.9', '10.8', '10.7', '10.6' ];

var source = "";
var retrytime = [];
    
if (_7zipData.url != null) {
    fs.mkdir(destination, (err) => { if (err) {}});
    platformUnpacker(source, destination)
    .then(function (mode) {
        if (mode='done') {
            var whattodelete = unarApptocopy.concat(_7zApptocopy).concat( [unarAppfile, _7zAppfile] );
                whattodelete.forEach(function (s) { fs.unlink(path.join(cwd, s), (err) => { if (err) console.error(err); }); });
            fs.remove(destination, (err) => { if (err) console.error(err); });
            console.log('Binaries copied successfully!');
        }   
    })
    .catch(function (err) { console.log(err); });    
}
 
function getDataForPlatform(){
    switch (process.platform) {
        // Mac version
        case "win32": return { 
            url: 'https://raw.githubusercontent.com/rudix-mac/packages/master/', 
            filename: 'p7zip-9.20.1-1.pkg',
            extraname: '7z920_extra.7z',
            extractfolder: '',
            applocation: 'usr/local/lib/p7zip',
            binaryfiles: [ '7z','7z.so','7za','7zCon.sfx','7zr','Codecs' ],
            sfxmodules: [ '7zS.sfx','7zS2.sfx','7zS2con.sfx','7zSD.sfx' ] 
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

function platformUnpacker(source, destination){
  return new retryPromise(function (resolve, retry, reject) {       
    wget({ url: unarAppurl + unarAppfile, dest: path.join(cwd,unarAppfile) })     
    .then(function () {
        wget({ url: _7zAppurl + _7zAppfile, dest: path.join(cwd,_7zAppfile) })     
        .then(function () { 
            console.log('Extracting: ' + unarAppfile + ', to decompress: ' + _7zAppfile ); 
            const extract = decompress(path.join(cwd,unarAppfile), cwd);
            extract.on('file', (name) => { console.log(name); }); 
            extract.on('error', (error) => { return reject(error); });
            extract.on('end', () => { 
                console.log('Extracting: ' + _7zAppfile + ', to decompress: ' + _7zipData.filename );
                unpack(path.join(cwd, _7zAppfile), '.', _7zApptocopy)
                .then(function() {  
                    var response = [];
                    downloadandcopy.forEach(function(macos, index) {  
                        fs.mkdir(path.join(destination,macos), (err) => { if (err) {} });
                        source = path.join(destination,macos, _7zipData.filename); 
                        console.log('Downloading ' + _7zipData.url + macos + '/' + _7zipData.filename);                      
                        node_wget({ url: _7zipData.url + macos + '/' + _7zipData.filename, dest: source}, function (err) { 
                            if (err) { console.error('Error downloading file: ' + err); return reject(err); }                          
                            response.push(index);
                            if(response.length === downloadandcopy.length) {
                                binaryextractor(source, destination)
                                .then(function(result) {  
                                    if (result='extractor done') resolve('done');
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
                console.log(text);
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
            console.log('Decompressing: p7zip-9.20.1-1'); 
            unpack(path.join(destination,'p7zip-9.20.1-1'), platform + '/' + macos, _7zipData.applocation + '/*')
            .then(function() { 
                whattocopy.forEach(function(s) { 
                    fs.moveSync(path.join(destination, _7zipData.extractfolder, _7zipData.applocation,s), path.join(__dirname,'binaries',platform,macos,s), { overwrite: true }); });
                resolve();
            }).catch(function (err) { reject(err); });
        } 
    });
}

function binaryextractor(source, destination) {
    var response = [];
  return new Promise(function (resolve, reject) { 
        downloadandcopy.forEach(function(macos, index) {  
            console.log('Decompressing Mac ' + macos + ' OS of ' + _7zipData.filename); 
            source = path.join(destination,macos, _7zipData.filename); 
            macunpack(source, path.join(destination,macos), macos)
            .then(function() {
                response.push(index);
                if(response.length === downloadandcopy.length) resolve('extractor done');
            }).catch(function (err) { reject(err); }); 
        });  
    });
}
