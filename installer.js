#!/usr/bin/env node
'use strict'

const fs = require('fs-extra'); 
const path = require('path');
const spawn = require('cross-spawn');
const uncompress = require('all-unpacker');
const retryPromise = require('retrying-promise'); 
const node_wget = require('node-wget');

var versionCompare = function(left, right) {
    if (typeof left + typeof right != 'stringstring')
        return false;
    
    var a = left.split('.');
    var b = right.split('.');
    var i = 0;
    var len = Math.max(a.length, b.length);
        
    for (; i < len; i++) {
        if ((a[i] && !b[i] && parseInt(a[i]) > 0) || (parseInt(a[i]) > parseInt(b[i]))) {
            return 1;
        } else if ((b[i] && !a[i] && parseInt(b[i]) > 0) || (parseInt(a[i]) < parseInt(b[i]))) {
            return -1;
        }
    }
    
    return 0;
}

const _7zAppurl = 'http://7-zip.org/a/';
const _7zipData = getDataForPlatform();
const whattocopy = _7zipData.binaryfiles;
const cwd = process.cwd();

// Will use P7zip 16.02 if installer find Mac OS is 10.11 or higher 
const downloadandcopy = [ '10.11', '10.10', '10.9', '10.8', '10.7', '10.6' ];
var retrytime = [];

var appleos = '';
try {     
    var appleos = (process.platform == "darwin") ? require('macos-release').version : '';	
} catch (e) { 
    var appleos = '99.99';
}
const macosversion = (appleos == '') ? appleos : ((versionCompare(appleos, '10.11') == -1) ? appleos : '10.11');

const zipextraname = (process.platform != "darwin") ? _7zipData.extraname : ((macosversion == '10.11') ? _7zipData.extraname[1] : _7zipData.extraname[0]);
const extrasource = path.join(cwd, zipextraname); 

const zipfilename = (process.platform != "darwin") ? _7zipData.filename : ((macosversion == '10.11') ? _7zipData.filename[1] : _7zipData.filename[0]); 
const zipsfxmodules = (process.platform != "darwin") ? _7zipData.sfxmodules : ((macosversion == '10.11') ? _7zipData.sfxmodules[0][1] : _7zipData.sfxmodules[0][0]);
const zipurl = (process.platform != "darwin") ? _7zipData.url : ((macosversion == '10.11') ? _7zipData.url[1] : _7zipData.url[0] + macosversion + '/' );

const source = path.join(cwd, zipfilename);
const destination = path.join(cwd, process.platform);

const binarydestination = path.join(__dirname,'binaries', process.platform);
const _7zcommand = path.join(binarydestination, ((process.platform == "win32") ? '7za.exe' : '7za'));

wget({ url: _7zAppurl + zipextraname, dest: extrasource })
	.then(function () {
		if (zipurl != null)  {
			fs.mkdir(destination, (err) => { if (err) {}});
            platformUnpacker(source, destination)
			.then(function (mode) {
				whattocopy.forEach(function(s) {        
					fs.moveSync(path.join(destination, _7zipData.extractfolder, _7zipData.applocation,s), 
						path.join(binarydestination,s), { overwrite: true });});
				if (process.platform != "win32") makeexecutable();
				console.log('Binaries copied successfully!');      
				fs.unlink(source, (err) => { if (err) console.error(err); });
                fs.remove(destination, (err) => { if (err) console.error(err); });
				var result = extraunpack(_7zcommand, extrasource, binarydestination, zipsfxmodules);
				// console.log(result); 
				fs.unlink(extrasource, (err) => { if (err) console.error(err); });
				console.log('Sfx modules copied successfully!');
			}).catch(function (err) { console.log(err); }); 
		} 
	})
	.catch(function (err) { 
		console.error('Error downloading file: ' + err);
	});
 
function makeexecutable() {
    var chmod = ['7z','7z.so','7za','7zCon.sfx','7zr'];
    chmod.forEach(function(s) { fs.chmodSync(path.join(binarydestination,s), 755) }); 
}
 
function getDataForPlatform() {
    switch (process.platform) {
        // Windows version
        case "win32": return { 
            url: 'http://d.7-zip.org/a/', 
            filename: '7z1805-extra.7z',
            extraname: 'lzma1805.7z',
            extractfolder: '',
            applocation: '',
            binaryfiles: ['Far','x64','7za.dll','7za.exe','7zxa.dll'],
            sfxmodules: ['7zr.exe','7zS2.sfx','7zS2con.sfx','7zSD.sfx'] };
        // Linux version
        case "linux": return { 
            url: 'http://cfhcable.dl.sourceforge.net/project/p7zip/p7zip/16.02/', 
            filename: 'p7zip_16.02_x86_linux_bin.tar.bz2',
            extraname: 'lzma1604.7z',
            extractfolder: 'p7zip_16.02',
            applocation: 'bin',
            binaryfiles: ['7z','7z.so','7za','7zCon.sfx','7zr','Codecs'],
            sfxmodules: ['7zS2.sfx','7zS2con.sfx','7zSD.sfx'] };
        // Mac version
        case "darwin": return { 
            url: [ 'https://raw.githubusercontent.com/rudix-mac/packages/master/', 'https://raw.githubusercontent.com/rudix-mac/pkg/master/' ],
            filename: [ 'p7zip-9.20.1-1.pkg', 'p7zip-16.02.pkg' ],
            extraname: [ '7z920_extra.7z', 'lzma1604.7z' ],
            extractfolder: '',
            applocation: 'usr/local/lib/p7zip',
            binaryfiles: ['7z','7z.so','7za','7zCon.sfx','7zr','Codecs'],
            sfxmodules: [['7zS.sfx','7zS2.sfx','7zS2con.sfx','7zSD.sfx'], ['7zS2.sfx','7zS2con.sfx','7zSD.sfx']] };
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
      return resolve();
    });
  });
}

function platformUnpacker(source, destination) {
  return new retryPromise(function (resolve, retry, reject) {
    wget({ url: zipurl + zipfilename, dest: source })
    .then(function () {   

        if (process.platform == "darwin") {   
            console.log('Extracting: ' + zipfilename );     
            unpack(source, destination)
            .then(function() {
                console.log('Decompressing: p7zipinstall.pkg/Payload' );  
                unpack(path.join(destination,'p7zipinstall.pkg','Payload'), destination)
                .then(function(data) {
                    console.log('Decompressing: Payload'); 
                    unpack(path.join(destination,'Payload'), destination, _7zipData.applocation + path.sep + '*')
                    .then( function(result) { 
                        // console.log(result);
                        return resolve('darwin'); 
                    })
                    .catch(function (err) { 
                        retrytime.push(err);
                        if ( retrytime.length === downloadandcopy.length ) reject(err);
                        else retry();                                     
                    }); 
                })     
                .catch(function (err) { 
                    retrytime.push(err);
                    if ( retrytime.length === downloadandcopy.length ) reject(err);
                    else retry();                                     
                }); 
            })
            .catch(function (err) { 
                retrytime.push(err);
                if ( retrytime.length === downloadandcopy.length ) reject(err);
                else retry();                                     
            }); 
		} else if (process.platform == "win32") {
            unpack(source, destination)
            .then(function (result) {
                // console.log(result);
                return resolve('win32'); 
            })
            .catch(function (err) { 
                retrytime.push(err);
                if ( retrytime.length === downloadandcopy.length ) reject(err);
                else retry();                                     
            });   
        } else if (process.platform == "linux") {
            unpack(source, destination)
            .then(function (result) {
                // console.log(result);
                const system_installer = require('system-installer');
                const distro = system_installer.packager();
                const toinstall = ((distro.packager == 'yum') || (distro.packager == 'dnf')) ? 'glibc.i686' : 'libc6-i386' ;
                system_installer.installer(toinstall)
                .then(function(result) {
                    // console.log(result);
                    return resolve('linux'); 
                })
                .catch(function (err) { 
                    retrytime.push(err);
                    if ( retrytime.length === downloadandcopy.length ) reject(err);
                    else retry();                                     
                });   			
            })
            .catch(function (err) { 
                retrytime.push(err);
                if ( retrytime.length === downloadandcopy.length ) reject(err);
                else retry();                                     
            });   
        }
    
    })
    .catch(function (err) { 
        retrytime.push(err);
        if ( retrytime.length === downloadandcopy.length ) reject(err);
        else retry();                                     
    });    
  });
}

function unpack(source, destination, tocopy) {
  return new Promise(function (resolve, reject) {
    uncompress.unpack(source, {  files: ((tocopy==null ) ? '' : tocopy),  
        targetDir: destination, forceOverwrite: true, noDirectory: true },
          function(err, files, text) {
            if (err) return reject(err);
            return resolve(text);
        }); 
    });
}

function extraunpack(cmd, source, destination, tocopy) {
    var args = [ 'e',source,'-o' + destination ];
    var extraargs = args.concat(tocopy).concat( ['-r','-aos'] );
    console.log('Running: ' + cmd + ' ' + extraargs);
    var extraunpacker = spawnsync(cmd, extraargs);     
    if (extraunpacker.error) return extraunpacker.error;
    else if (extraunpacker.stdout.toString()) return extraunpacker.stdout.toString();
}

function spawnsync(spcmd, spargs) {
    var dounpack = spawn.sync(spcmd, spargs, { stdio: 'pipe' });     
    if (dounpack.error) {
        console.error('Error 7za exited with code ' + dounpack.error);
        console.log('resolve the problem and re-install using:');
        console.log('npm install');
        return dounpack;
    } else return dounpack;
}