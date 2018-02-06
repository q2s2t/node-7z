#!/usr/bin/env node
'use strict'

var fs = require('fs-extra'); 
var path = require('path');
var decompress = require('inly');
var spawn = require('cross-spawn');
var uncompress = require('unpack-all');
var macuncompress = require('xar');
var node_wget = require('node-wget');

const macosversion = (process.platform == "darwin") ? require('macos-release').version : '';
const _7zipData = getDataForPlatform();
const whattocopy = _7zipData.binaryfiles;

const _7zAppfile = '7z1604-extra.7z';
const _7zApptocopy = [ '7za.dll','7za.exe','7zxa.dll' ];
const _7zAppurl = 'http://7-zip.org/a/';

const unarAppfile = (process.platform == "darwin") ? 'unar1.8.1.zip' : 'unar1.8.1_win.zip' ;  
const unarApptocopy = [ 'lsar.exe','unar.exe','Foundation.1.0.dll' ];
const unarAppurl = 'https://storage.googleapis.com/google-code-archive-downloads/v2/code.google.com/theunarchiver/';

const cwd = process.cwd();
const destination = path.join(cwd, process.platform);
const source = path.join(cwd, _7zipData.filename);

const binarydestination = path.join(__dirname,'binaries', (macosversion=='') ? process.platform : process.platform, macosversion );
const extrasource = path.join(cwd, _7zipData.extraname); 
const _7zcommand = path.join(binarydestination, process.platform === "win32" ? '7za.exe' : '7za' );
            

if ((_7zipData.url != null) && (process.platform != "darwin"))   {
    fs.mkdir(destination, (err) => { if (err) {}});
	node_wget({ url: _7zAppurl + _7zipData.extraname, dest: extrasource }, function (err) {
        if (err) { console.error('Error downloading file: ' + err);   return reject(err); }  });
    wget({ url: _7zipData.url + _7zipData.filename, dest: source })
    .then(function () {   
        platformUnpacker(source, destination)
        .then(function (mode){
            whattocopy.forEach(function(s) {                
                fs.moveSync(path.join(destination, _7zipData.extractfolder, _7zipData.applocation,s), 
                    path.join(binarydestination,s), 
                    { overwrite: true });
                });
            if (process.platform != "win32") { 
                var _7zchmod = ['7z','7z.so','7za','7zCon.sfx','7zr'];
                _7zchmod.forEach(function(s) { fs.chmodSync(path.join(binarydestination,s), 755) }); 
            }
            console.log('Binaries copied successfully!');      
            if (mode=='darwin') {
                var whattodelete = unarApptocopy.concat(_7zApptocopy).concat( [unarAppfile, _7zAppfile] );
                whattodelete.forEach(function (s) { fs.unlink(path.join(cwd, s), (err) => { if (err) console.error(err); }); });
            } else if (mode=='win32') {
                var whattodelete = unarApptocopy.concat( unarAppfile );
                whattodelete.forEach(function (s) { fs.unlink(path.join(cwd, s), (err) => { if (err) console.error(err); }); });
            }
            fs.unlink(source, (err) => { if (err) console.error(err); });
            fs.remove(destination, (err) => { if (err) console.error(err); });
            var result = extraunpack(_7zcommand, extrasource, binarydestination, _7zipData.sfxmodules);
            console.log(result); 
            console.log('Sfx modules copied successfully!');
            fs.unlink(extrasource, (err) => { if (err) console.error(err); });
        }).catch(function (err) { console.log(err); }); 
    }).catch(function (err) { console.log(err); });       
} else if (process.platform == "darwin") {
    node_wget({ url: _7zAppurl + _7zipData.extraname, dest: extrasource }, function (err) {
        if (err) { console.error('Error downloading file: ' + err);   return reject(err); }  });
    var result = extraunpack(_7zcommand, extrasource, binarydestination, _7zipData.sfxmodules);
    console.log(result);     
    fs.unlink(extrasource, (err) => { if (err) console.error(err); });
    console.log('Sfx modules copied successfully!');
}
 
function getDataForPlatform(){
    switch (process.platform) {
        // Windows version
        case "win32": return { url: 'http://d.7-zip.org/a/', 
        filename: '7z1801-extra.7z',
        extraname: 'lzma1801.7z',
        extractfolder: '',
        applocation: '',
        binaryfiles: ['Far','x64','7za.dll','7za.exe','7zxa.dll'],
        sfxmodules: ['7zr.exe','7zS2.sfx','7zS2con.sfx','7zSD.sfx'] };
        // Linux version
        case "linux": return { url: 'http://cfhcable.dl.sourceforge.net/project/p7zip/p7zip/16.02/', 
        filename: 'p7zip_16.02_x86_linux_bin.tar.bz2',
        extraname: 'lzma1604.7z',
        extractfolder: 'p7zip_16.02',
        applocation: 'bin',
        binaryfiles: ['7z','7z.so','7za','7zCon.sfx','7zr','Codecs'],
        sfxmodules: ['7zS2.sfx','7zS2con.sfx','7zSD.sfx'] };
        // Mac version
        case "darwin": return { url: 'https://raw.githubusercontent.com/rudix-mac/packages/master/' + macosversion + '/', 
        filename: 'p7zip-9.20.1-1.pkg',
        extraname: '7z920_extra.7z',
        extractfolder: '',
        applocation: 'usr/local/lib/p7zip',
        binaryfiles: ['7z','7z.so','7za','7zCon.sfx','7zr','Codecs'],
        sfxmodules: ['7zS.sfx','7zS2.sfx','7zS2con.sfx','7zSD.sfx'] };
    }
}

function wget(path) {
  console.log('Downloading ' + path.url);
  return new Promise(function (resolve, reject) {
    require('node-wget')(path, function (err) {
      if (err) {
        console.error('Error downloading file: ' + err);
        return reject(err);
      }
      resolve();
    });
  });
}

function platformUnpacker(source, destination){
  return new Promise(function (resolve, reject) {
    if ((process.platform == "win32") || (process.platform == "darwin_not_ready")) {          
        wget({ url: unarAppurl + unarAppfile, dest: path.join(cwd,unarAppfile) })     
        .then(function () {
            console.log('Extracting: ' + unarAppfile + ', to decompress: ' + ((process.platform == "win32") ? _7zipData.filename : _7zAppfile )); 
            const extract = decompress(path.join(cwd,unarAppfile), cwd);
            extract.on('file', (name) => { console.log(name); }); 
            extract.on('error', (error) => { return reject(error); });
            extract.on('end', () => {
                if (process.platform == "darwin") {        
                    wget({ url: _7zAppurl + _7zAppfile, dest: path.join(cwd,_7zAppfile) })     
                    .then(function () { 
                        console.log('Extracting: ' + _7zAppfile + ', to decompress: ' + _7zipData.filename );
                        unpack(path.join(cwd, _7zAppfile), '.', _7zApptocopy)
                        .then(function() {
                            console.log('Decompressing ' + _7zipData.filename);  
                            macunpack(source, destination)
                            //winunpack(source, destination)
                            .then(function(data) {
                                //console.log('Decompressing: p7zip-9.20.1-1'); 
                                //unpack(path.join(destination,'p7zip-9.20.1-1'), process.platform, _7zipData.applocation + path.sep +'*')
                                console.log('Decompressing: p7zipinstall.pkg/Payload'); 
                                unpack(path.join(destination,'p7zipinstall.pkg','Payload'), process.platform, _7zipData.applocation + path.sep + '*')
                                .then( function(result) { 
                                    console.log(result);
                                    resolve('darwin'); })
                                .catch(function (err) { return reject(err); });  
                            })     
                            .catch(function (err) { return reject(err); }); 
                        })
                        .catch(function (err) { return reject(err); }); 
                    }) 
                    .catch(function (err) { return reject(err); }); 
                } else {
                    unpack(source, process.platform)
                    .then(function (result) {
                        console.log(result);
                        resolve('win32'); })
                    .catch(function (err) { return reject(err); }); 
                }
            });    
        })
        .catch(function (err) { return reject(err); });  
    } else if (process.platform == "linux") {
        console.log('Decompressing ' + _7zipData.filename);     
        const extract = decompress(source, destination);
        extract.on('file', (name) => { if ( whattocopy.indexOf(path.basename(name)) > 0) console.log(name); }); 
        extract.on('error', (error) => { return reject(error); });
        extract.on('end', () => { 
			const system_installer = require('system-install');
			const cmd = system_installer().split(" ")[0];
			const args = [ system_installer().split(" ")[1] ];
			const distro = args.concat(['install','-y']).concat(((system_installer().split(" ")[1] == 'yum') || (system_installer().split(" ")[1] == 'dnf')) ? ['glibc.i686'] : ['libc6-i386']);
			console.log(cmd  + ' ' + distro);
			spawn.sync(cmd, distro, { stdio: 'pipe' });
			resolve('linux'); 
		});
    }
  });
}

function unpack(source, destination, tocopy) {
  return new Promise(function (resolve, reject) {
    uncompress.unpack(source, {  files: (tocopy==null ) ? '' : tocopy,  
        targetDir: destination, forceOverwrite: true, noDirectory: true },
          function(err, files, text) {
            if (err) return reject(err);
            resolve(text);
        }); 
    });
}

function macunpack(source,destination){
    var content = fs.readFileSync(source)
  return new Promise(function (resolve, reject) {
    macuncompress.unpack(content, function (err, file, content) {
        if (err) return reject(err);
        if (file.type[0] === 'directory'){
            console.log('mkdir', file.path);
            fs.mkdirSync(path.join(destination, file.path));
        } else {
            console.log('extract', file.path);
            if (file.path == 'p7zipinstall.pkg/Payload') {
                fs.writeFileSync(path.join(destination, file.path), content);
                // need to find way to extract Payload file, xar module creating unknown format
                // fs.createReadStream(path.join(destination, file.path)).pipe(gunzip()).pipe(cpio.extract(destination));
                resolve();                
            } else {
                fs.writeFileSync(path.join(destination, file.path), content);
            }
        }        
        });
    });
}

function winunpack(source, destination){
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
            resolve(winunpacker.stdout.toString());
        }
    });
}

function extraunpack(cmd, source, destination, tocopy) {
    var args = [ 'e',source,'-o' + destination ];
    var extraargs = args.concat(tocopy).concat( ['-r','-aos'] );
    console.log('Running: ' + cmd );
    var extraunpacker = spawn.sync(cmd, extraargs, { stdio: 'pipe' });     
    if (extraunpacker.error) {
        console.error('7za exited with code ' + extraunpacker.error);
        console.log('resolve the problem and re-install using:');
        console.log('npm install');
        return extraunpacker.error;
    } else if (extraunpacker.stdout.toString()) {
        return extraunpacker.stdout.toString();
    }
}
