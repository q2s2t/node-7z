var fs = require('fs-extra'); 
var path = require('path');
var decompress = require('inly');
var uncompress = require('unpack-all');
var macuncompress = require('xar');

const _7zipData = getDataForPlatform();
const whattocopy = _7zipData.binaryfiles;
const unarfile = ( process.platform == "win32" ) ? 'unar1.8.1_win.zip' : 'unar1.8.1.zip' ;

const cwd = process.cwd();
const destination = path.join(cwd, process.platform);
const source = path.join(cwd, _7zipData.filename);

fs.mkdir(destination, (err) => { if (err) {}});
wget({ url: _7zipData.url + _7zipData.filename, dest: source })
    .then(function () {
        console.log('Decompressing ' + _7zipData.filename);        
        platformUnpacker(source, destination)
        .then(function (mode){
            //fs.move(path.join(destination, _7zipData.extractfolder, _7zipData.applocation),
            //          path.join(__dirname,'binaries',process.platform),
            //      { overwrite: true }, (err) => { if (err) return console.error(err) });
                console.log('Binaries copied successfully!');
                //if ( mode=='done'){
                //    fs.unlink(path.join(cwd, unarfile), (err) => { if (err) console.error(err); });   
                //    fs.unlink(path.join(cwd, 'lsar.exe'), (err) => { if (err) console.error(err); });   
                //    fs.unlink(path.join(cwd, 'unar.exe'), (err) => { if (err) console.error(err); });   
                //    fs.unlink(path.join(cwd, 'Foundation.1.0.dll'), (err) => { if (err) console.error(err); });   
                //}
                //fs.unlink(source, (err) => { if (err) console.error(err); });
                //fs.remove(destination, (err) => { if (err) console.error(err); });
        }); 
    })
    .catch(function (err) { onsole.log(err); });

function getDataForPlatform(){
    if (process.platform == "win32") var macos = '10.6';//require('macos-release').version;
    switch (process.platform) {
        // Windows version
        case "darwin": return { url: 'http://d.7-zip.org/a/', 
        filename: '7z1800-extra.7z',
        extraname: 'lzma1800.7z',
        extractfolder: '',
        applocation: '',
        binaryfiles: ['7za.dll','7za.exe','7zxa.dll','7zr.exe'],
        sfxmodules: ['7zS2.sfx','7zS2con.sfx','7zSD.sfx'] };
        // Linux version
        case "linux": return { url: 'http://cfhcable.dl.sourceforge.net/project/p7zip/p7zip/16.02/', 
        filename: 'p7zip_16.02_x86_linux_bin.tar.bz2',
        extraname: 'lzma1604.7z',
        extractfolder: 'p7zip_16.02',
        applocation: 'bin',
        binaryfiles: ['7z','7z.so','7za','7zCon.sfx','7zr','Codecs','Rar.so'],
        sfxmodules: ['7zS2.sfx','7zS2con.sfx','7zSD.sfx'] };
        // Mac version
        case "win32": return { url: 'https://raw.githubusercontent.com/rudix-mac/packages/master/' + macos + '/', 
        filename: 'p7zip-9.20.1-1.pkg',
        extraname: '7z920_extra.7z',
        extractfolder: '',
        applocation: 'usr\local\lib\p7zip',
        binaryfiles: ['7z','7z.so','7za','7zCon.sfx','7zr','Codecs','Rar.so'],
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
    if ((process.platform == "win32") || (process.platform == "darwin")) {        
        wget({ url: 'https://storage.googleapis.com/google-code-archive-downloads/v2/code.google.com/theunarchiver/' +  unarfile,         dest: path.join(cwd,unarfile) })
            .then(function () {
                console.log('Decompressing ' + unarfile); 
                const extract = decompress(path.join(cwd,unarfile), cwd);
                extract.on('file', (name) => { console.log(name); }); 
                extract.on('error', (error) => { return reject(error); });
                extract.on('end', () => { 
                    if (process.platform == "darwin") {
                        macunpack(source, destination)
                        .then(function() {
                            console.log('Decompressing: p7zipinstall.pkg->Payload'); 
                            unpack(path.join(destination,'p7zipinstall.pkg','Payload'), destination)
                            .then( resolve('done') )
                            .catch(function (err) { return reject(err); });   
                        })     
                        .catch(function (err) { return reject(err); });   
                    } else {
                        unpack(source, destination)
                        .then( resolve('done') )
                        .catch(function (err) { return reject(err); });   
                    }
                });  
            })
            .catch(function (err) { return reject(err); });  
    } else if (process.platform == "linux") {
        const extract = decompress(source, destination);
        extract.on('file', (name) => { if (whattocopy.indexOf(path.basename(name)) > 0) console.log(name); }); 
        extract.on('error', (error) => { return reject(error); });
        extract.on('end', () => { resolve('linux'); });     
    }
  });
}

function unpack(source,destination) {
  return new Promise(function (resolve, reject) {
    uncompress.unpack(source, { targetDir: destination, forceOverwrite: true,
                                noRecursion: false, noDirectory: true, copyTime: true, quiet: false },
          function(err, files, text) {
            if (err) return reject(err);
            if (files) console.log('files', files);
            if (text) console.log('text', text);
            resolve('unpack');
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
            fs.writeFileSync(path.join(destination, file.path), content);
            resolve(content);
        }        
        });
    });
}
