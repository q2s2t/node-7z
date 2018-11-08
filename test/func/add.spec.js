/* global describe, it, before */
import { expect } from 'chai'
import { copyFileSync, existsSync, statSync } from 'fs'
import { add } from '../../src/commands.js'
import { getAlternateBinByPlatform } from '../helper.js'
import normalize from 'normalize-path'

const mockDir = './test/_mock'
const tmpDir = './test/_tmp'

describe('Functional: add()', function () {
  before(function () {
    getAlternateBinByPlatform()
  })

  it('should emit error on 7z error', function (done) {
    const seven = add('', '')
    seven.on('error', function (err) {
      expect(err).to.be.an.instanceof(Error)
      expect(err.message).to.be.a('string')
      expect(err.stderr).to.be.a('string')
      done()
    })
  })

  it('should emit error on spawn error', function (done) {
    const archive = ``
    const target = ``
    const bin = '/i/hope/this/is/not/where/your/7zip/bin/is'
    const seven = add(archive, target, { $bin: bin })
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
    const archive = `${tmpDir}/progress.7z`
    const source = `${mockDir}/DirHex/`
    const seven = add(archive, source, { bs: ['p1'] })
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

  it('should create an archive of correct size', function (done) {
    const archive = `${tmpDir}/size.7z`
    const source = `${mockDir}/DirHex/`
    const seven = add(archive, source)
    seven.on('end', function () {
      const size = statSync(archive).size
      expect(size).to.greaterThan(398)
      expect(existsSync(archive)).to.equal(true)
      done()
    })
  })

  it('should get info from headers and footers', function (done) {
    const archive = `${tmpDir}/headers-and-footers.7z`
    const source = `${mockDir}/DirHex/`
    const seven = add(archive, source)
    seven.on('end', function () {
      // headers
      expect(seven.info.get('Creating archive')).to.equal(normalize(archive))
      // footers
      expect(seven.info.get('Files read from disk')).to.equal('24')
      expect(seven.info.get('Archive size')).to.be.a('string')
      done()
    })
  })

  it('should emit data', function (done) {
    const archive = `${tmpDir}/files-add.7z`
    const source = `${mockDir}/DirHex/`
    const seven = add(archive, source)
    let counter = 0
    seven.on('data', function (data) {
      ++counter
      expect(data.symbol).to.equal('+')
      expect(data.file).to.be.a('string')
    }).on('end', function () {
      expect(counter).to.be.equal(24)
      done()
    })
  })

  it('should accept multiple sources as a flat array', function (done) {
    const archive = `${tmpDir}/txt-and-md-only.7z`
    const source = [
      `${mockDir}/DirExt/*.txt`,
      `${mockDir}/DirExt/*.md`
    ]
    const seven = add(archive, source, {
      r: true
    })
    seven.on('end', function () {
      expect(seven.info.get('Files read from disk')).to.equal('6')
      done()
    })
  })

  it('should add files to an exisiting archive', function (done) {
    const archiveBase = `${mockDir}/DirNew/DirEmpty.7z`
    const archive = `${tmpDir}/files-add-existing.7z`
    const source = [
      `${mockDir}/DirExt/*.txt`,
      `${mockDir}/DirExt/*.md`
    ]
    copyFileSync(archiveBase, archive)
    const seven = add(archive, source, {
      r: true
    })
    seven.on('data', function (data) {
      expect(data.symbol).to.equal('+')
      expect(data.file).to.be.a('string')
    }).on('end', function () {
      expect(seven.info.get('Open archive')).to.equal(archive)
      expect(seven.info.get('Updating archive')).to.equal(archive)
      expect(seven.info.get('Files read from disk')).to.equal('6')
      expect(seven.info.get('Archive size')).to.be.a('string')
      done()
    })
  })

  it('should update files of an exisiting archive', function (done) {
    const archiveBase = `${mockDir}/DirNew/BaseExt.7z`
    const archive = `${tmpDir}/files-add-update-existing.7z`
    const source = `./${mockDir}/DirExtUpdate/*`
    const seven = add(archive, source, { bs: ['p1'] })
    copyFileSync(archiveBase, archive)
    seven.on('data', function (data) {
      expect(data.symbol).to.equal('U')
      expect(data.file).to.be.a('string')
    }).on('end', function () {
      expect(seven.info.get('Open archive')).to.equal(archive)
      expect(seven.info.get('Updating archive')).to.equal(archive)
      expect(seven.info.get('Files read from disk')).to.equal('3')
      expect(seven.info.get('Archive size')).to.be.a('string')
      done()
    })
  })

  it('should work with atlernate $bin', function (done) {
    const archive = `${tmpDir}/headers-and-footers-path.7z`
    const source = `${mockDir}/DirHex/`
    const seven = add(archive, source, { $bin: `${tmpDir}/Seven Zip` })
    seven.on('end', function () {
      // headers
      expect(seven.info.get('Creating archive')).to.equal(archive)
      // footers
      expect(seven.info.get('Files read from disk')).to.equal('24')
      expect(seven.info.get('Archive size')).to.be.a('string')
      done()
    })
  })
})
