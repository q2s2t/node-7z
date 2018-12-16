/* global describe, it */
const { expect } = require('chai')
const { copyFileSync } = require('fs')
const Seven = require('../../src/main')

const test = Seven.test
const mockDir = './test/_mock'
const tmpDir = './test/_tmp'

describe('Functional: test()', function () {
  it('should emit error on 7z error', function (done) {
    const archive = `${tmpDir}/testnot.7z`
    const seven = test(archive)
    seven.on('error', function (err) {
      expect(err).to.be.an.instanceof(Error)
      expect(err.level.toUpperCase()).to.equal('ERROR')
      expect(err.message).to.be.a('string')
      done()
    })
  })

  it('should emit error on spawn error', function (done) {
    const archive = ``
    const target = ``
    const bin = '/i/hope/this/is/not/where/your/7zip/bin/is'
    const seven = test(archive, { $bin: bin, $cherryPick: target })
    seven.on('error', function (err) {
      expect(err).to.be.an.instanceof(Error)
      expect(err.errno).to.equal('ENOENT')
      expect(err.code).to.equal('ENOENT')
      expect(err.syscall).to.equal(`spawn ${bin}`)
      expect(err.path).to.equal(bin)
      done()
    })
  })

  it('should emit progress', function (done) {
    const archiveBase = `${mockDir}/DirNew/NewImages.7z`
    const archive = `${tmpDir}/test-progress.7z`
    copyFileSync(archiveBase, archive)
    const seven = test(archive, { $progress: true })
    let once = false
    seven.on('progress', function (progress) {
      once = true
      expect(progress.percent).to.be.an('number')
      expect(progress.fileCount).to.be.an('number')
    }).on('end', function () {
      expect(once).to.be.equal(true)
      done()
    })
  })

  it('should emit data', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/test-data.7z`
    copyFileSync(archiveBase, archive)
    const seven = test(archive)
    let counter = 0
    seven.on('data', function (data) {
      ++counter
      expect(data.symbol).to.equal('T')
      expect(data.file).to.be.a('string')
    }).on('end', function () {
      expect(counter).to.be.equal(12)
      done()
    })
  })

  it('should get info from headers and footers', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/test-headers-footers.7z`
    copyFileSync(archiveBase, archive)
    const seven = test(archive)
    seven.on('end', function () {
      // headers
      expect(seven.info.get('Method')).to.equal('LZMA2:12')
      // footers
      expect(seven.info.get('Files')).to.equal('9')
      expect(seven.info.get('Size')).to.equal('81')
      expect(seven.info.get('Compressed')).to.equal('290')
      done()
    })
  })

  it('should accept single target as a string', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/test-single.7z`
    copyFileSync(archiveBase, archive)
    const target = `*.txt`
    const seven = test(archive, { recursive: true, $cherryPick: target })
    let counter = 0
    seven.on('data', function (data) {
      ++counter
      const ext = data.file.split('.')[1]
      switch (ext) {
        case 'txt':
          expect(data.symbol).to.equal('T')
          break
        default:
          expect(data.symbol).to.equal('.')
      }
    })
    seven.on('end', function () {
      expect(counter).to.equal(9)
      done()
    })
  })

  it('should accept multiple targets as a array', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/test-multiple.7z`
    copyFileSync(archiveBase, archive)
    const target = [
      `*.txt`,
      `*.md`
    ]
    const seven = test(archive, { recursive: true, $cherryPick: target })
    let counter = 0
    seven.on('data', function (data) {
      ++counter
      const ext = data.file.split('.')[1]
      switch (ext) {
        case 'txt':
          expect(data.symbol).to.equal('T')
          break
        case 'md':
          expect(data.symbol).to.equal('T')
          break
        default:
          expect(data.symbol).to.equal('.')
      }
    })
    seven.on('end', function () {
      expect(counter).to.equal(9)
      done()
    })
  })

  it('should work with atlernate $bin', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/test-path.7z`
    copyFileSync(archiveBase, archive)
    const seven = test(archive, { $bin: `${tmpDir}/Seven Zip` })
    seven.on('end', function () {
      // headers
      expect(seven.info.get('Method')).to.equal('LZMA2:12')
      // footers
      expect(seven.info.get('Files')).to.equal('9')
      expect(seven.info.get('Size')).to.equal('81')
      expect(seven.info.get('Compressed')).to.equal('290')
      done()
    })
  })
})
