/* global describe, it */
const { expect } = require('chai')
const { copyFileSync } = require('fs')
const Seven = require('../../src/main')

const list = Seven.list
const mockDir = './test/_mock'
const tmpDir = './test/_tmp'

describe('Functional: list()', function () {
  it('should emit error on 7z error', function (done) {
    const archive = '/i/hope/this/is/not/where/your/archive/is'
    const seven = list(archive)
    seven.on('error', function (err) {
      expect(err).to.be.an.instanceof(Error)
      done()
    })
  })

  it('should emit error on spawn error', function (done) {
    const bin = '/i/hope/this/is/not/where/yout/7zip/bin/is'
    const seven = list('archive', {
      $bin: bin
    })
    seven.on('error', function (err) {
      expect(err).to.be.an.instanceof(Error)
      expect(err.code).to.equal('ENOENT')
      expect(err.syscall).to.equal(`spawn ${bin}`)
      expect(err.path).to.equal(bin)
      done()
    })
  })

  it('should set headers and footers infos', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/list-header-footer.7z`
    copyFileSync(archiveBase, archive)
    const seven = list(archive, { recursive: true })
    seven.on('end', function () {
      expect(seven.info.get('Physical Size')).to.equal('290')
      expect(seven.info.get('Type')).to.equal('7z')
      done()
    })
  })

  it('should single accept single $cherryPick as a string', function () {
    const seven = list('archive.7z', {
      $cherryPick: 'target1',
      $defer: true
    })
    expect(seven._args).to.contain('target1')
  })

  it('should multiple accept multiple $cherryPick as an array', function () {
    const seven = list('archive.7z', {
      $cherryPick: ['target1', 'target2'],
      $defer: true
    })
    expect(seven._args).to.contain('target1')
    expect(seven._args).to.contain('target2')
  })

  it('should accept $cherryPick and give the good values', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/list-exist.7z`
    copyFileSync(archiveBase, archive)
    const seven = list(archive, { recursive: true, $cherryPick: '*.txt' })
    const data = []
    const expectedData = [
      { attributes: '....A', size: 9, sizeCompressed: undefined, file: 'DirExt/root.txt' },
      { attributes: '....A', size: 9, sizeCompressed: undefined, file: 'DirExt/sub1/sub1.txt' },
      { attributes: '....A', size: 9, sizeCompressed: undefined, file: 'DirExt/sub2/sub2.txt' }
    ]
    seven.on('data', d => data.push(d))
    seven.on('end', function () {
      const withoutDatetime = data
        .map(function (d) {
          const { datetime, ...rest } = d
          return rest
        })
      const dates = data.map(d => d.datetime)
      for (const d of dates) {
        expect(d).to.be.a('date')
      }
      expect(withoutDatetime).to.deep.contain(expectedData[0])
      expect(withoutDatetime).to.deep.contain(expectedData[1])
      expect(withoutDatetime).to.deep.contain(expectedData[2])
      expect(data.length).to.equal(3)
      done()
    })
  })

  it('should emit data', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/list-data.7z`
    copyFileSync(archiveBase, archive)
    let counter = 0
    const seven = list(archive, { recursive: true })
    seven.on('data', function (data) {
      ++counter
      expect(data.file).to.be.a('string')
    }).on('end', function () {
      expect(counter).to.be.equal(12)
      done()
    })
  })

  it('should NOT emit progress', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/list-progress.7z`
    copyFileSync(archiveBase, archive)
    let once = false
    const seven = list(archive, {
      recursive: true,
      $progress: true
    })
    seven.on('progress', function (progress) {
      once = true
      expect(progress.percent).to.be.an('number')
      expect(progress.fileCount).to.be.an('number')
    }).on('end', function () {
      expect(once).to.be.equal(false)
      done()
    })
  })

  it('should work with atlernate $bin', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/list-path.7z`
    copyFileSync(archiveBase, archive)
    let counter = 0
    const seven = list(archive, {
      recursive: true,
      $bin: `${tmpDir}/Seven Zip`
    })
    seven.on('data', function (data) {
      ++counter
      expect(data.file).to.be.a('string')
    }).on('end', function () {
      expect(counter).to.be.equal(12)
      done()
    })
  })

  it('should list technical data', function (done) {
    const archiveBase = `${mockDir}/DirNew/NewArchive.7z`
    const archive = `${tmpDir}/list-slt.7z`
    copyFileSync(archiveBase, archive)
    let technical_data = []
    let integrity_test = false
    const seven = list(archive, 
      { techInfo: true }
    )
    seven.on('data', function (data) {
      technical_data.push(data)
      expect(data.file).to.be.a('string')
      if (data.file === 'DirHex/sub2/f930abffa355e') {
        expect(data.techInfo.get('Path')).to.equal('DirHex/sub2/f930abffa355e')
        expect(data.techInfo.get('Size')).to.equal('9')
        expect(data.techInfo.get('CRC')).to.equal('FEDC304F')
        expect(data.techInfo.get('Encrypted')).to.equal('-')
        expect(data.techInfo.get('Method')).to.equal('LZMA2:12')
        expect(data.techInfo.get('Block')).to.equal('0')
        integrity_test = true
      }
    }).on('end', function () {
      expect(seven.info.get('Blocks')).to.equal('1')
      expect(technical_data.length).to.equal(30)
      expect(integrity_test).to.equal(true)
      done()
    })
  })

  it('should list technical data of zip archives', function (done) {
    const archiveBase = `${mockDir}/DirNew/NewArchive.zip`
    const archive = `${tmpDir}/list-slt.zip`
    copyFileSync(archiveBase, archive)
    let technical_data = []
    let integrity_test = false
    const seven = list(archive, 
      { techInfo: true }
    )
    seven.on('data', function (data) {
      technical_data.push(data)
      expect(data.file).to.be.a('string')
      if (data.file === 'DirHex/sub2/f930abffa355e') {
        expect(data.techInfo.get('Path')).to.equal('DirHex/sub2/f930abffa355e')
        expect(data.techInfo.get('Size')).to.equal('9')
        expect(data.techInfo.get('CRC')).to.equal('FEDC304F')
        expect(data.techInfo.get('Encrypted')).to.equal('-')
        expect(data.techInfo.get('Method')).to.equal('Store')
        // expect(data.techInfo.get('Offset')).to.equal('1698')
        integrity_test = true
      }
    }).on('end', function () {
      expect(seven.info.get('Type')).to.equal('zip')
      expect(technical_data.length).to.equal(30)
      expect(integrity_test).to.equal(true)
      done()
    })
  })
})
