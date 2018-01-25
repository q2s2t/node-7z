var fs = require('fs-extra'); // testing needed to move the files, having issues all other ways
var path = require('path');
var decompress = require('inly');
if (process.platform == "darwin") var macunpack = require('xar'); 
// will use zip binary 7za.exe on windows to extract 7z 
var winfilezip = '7za920.zip';

const _7zipData = getDataForPlatform();
const whattocopy = _7zipData.binaryfiles;
const cwd = process.cwd();
const destination = path.join(cwd, process.platform);
const source = path.join(cwd, _7zipData.filename);

fs.mkdir(destination, (err) => { if (err) {}});
wget({ url: _7zipData.url + _7zipData.filename, dest: source })
    .then(function () {
        console.log('Decompressing ' + _7zipData.filename);
        const extract = decompress(source, destination);
        extract.on('file', (name) => {
            console.log(name);
            //////////////////
            if (whattocopy.indexOf(path.basename(name)) == 1){
                fs.renameSync(path.join(destination, _7zipData.extractfolder, _7zipData.applocation,path.basename(name)), path.join(__dirname,'binaries',process.platform,path.basename(name)));
                console.log('--->File copied!');                
            }
            //////////////////
        }); 
        extract.on('error', (error) => {
            console.error(error);
        });
        extract.on('end', () => {
            console.log('done');
            fs.unlinkSync(source);
            rmdir(destination);
        });
    });
    
function getDataForPlatform(){
    if (process.platform == "darwin") var macos = require('macos-release').version;
    switch (process.platform) {
        // Windows version
        case "linux": return { url: 'http://d.7-zip.org/a/', 
        filename: '7z1800-extra.7z',
        extraname: 'lzma1800.7z',
        extractfolder: '',
        applocation: '',
        binaryfiles: [ '7za.dll', '7za.exe', '7zxa.dll', 'x64', '7zr.exe' ],
        sfxmodules: ['7zS2.sfx','7zS2con.sfx','7zSD.sfx'] };
        // Linux version
        case "win32": return { 
        url: 'http://cfhcable.dl.sourceforge.net/project/p7zip/p7zip/16.02/', 
        filename: 'p7zip_16.02_x86_linux_bin.tar.bz2',
        extraname: 'lzma1604.7z',
        extractfolder: 'p7zip_16.02',
        applocation: 'bin',
        binaryfiles: ['7z','7z.so','7za','7zCon.sfx','7zr','Codecs','Rar.so'],
        sfxmodules: ['7zS2.sfx','7zS2con.sfx','7zSD.sfx'] };
        // Mac version
        case "darwin": return { url: 'https://raw.githubusercontent.com/rudix-mac/packages/master/' + macos + '/', 
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
        console.error('Error downloading file: ');
        console.error(err);
        return reject();
      }
      resolve();
    });
  });
}

function rmdir(dir) {
  var filename, i, item, len, list, stat;
  list = fs.readdirSync(dir);
  for (i = 0, len = list.length; i < len; i++) {
    item = list[i];
    filename = path.join(dir, item);
    stat = fs.statSync(filename);
    if (filename === "." || filename === "..") {

    } else if (stat.isDirectory()) {
      rmdir(filename);
    } else {
      fs.unlinkSync(filename);
    }
  }
  return fs.rmdirSync(dir);
}