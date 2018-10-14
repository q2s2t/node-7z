/* global describe, it, before, after */
import { expect } from 'chai'
import { existsSync, statSync } from 'fs'
import { sync as rimraf } from 'rimraf'
import kill from 'tree-kill'
import { add } from '../../lib/commands.js'

const mockDir = './test/_mock'
const tmpDir = './test/_tmp'

describe('Functional: add()', function () {
  it('should return an error on 7z error', function (done) {
    const archive = `${tmpDir}/addnot.7z`
    const source = `${mockDir}/dev/null`
    const seven = add(archive, source)
    seven.on('error', function (err) {
      expect(err).to.be.an.instanceof(Error)
      expect(err.level).to.equal('WARNING')
      expect(err.message).to.equal('No such file or directory')
      expect(err.path).to.equal(source)
      done()
    })
  })

  it('should return an error on spawn error', function (done) {
    const archive = ``
    const source = ``
    const bin = '/i/hope/this/is/not/where/yout/7zip/bin/is'
    const seven = add(archive, source, {
      $bin: bin
      // or this test will fail
    })
    seven.on('error', function (err) {
      expect(err).to.be.an.instanceof(Error)
      expect(err.errno).to.equal('ENOENT')
      expect(err.code).to.equal('ENOENT')
      expect(err.syscall).to.equal(`spawn ${bin}`)
      expect(err.path).to.equal(bin)
      done()
    })
  })

  it('should emit progress values', function (done) {
    const archive = `${tmpDir}/progress.7z`
    const source = `${mockDir}/DirHex/`
    const seven = add(archive, source, { bs: ['p1'] })
    let once = false
    seven.on('progress', function (progress) {
      once = true
      expect(progress.percent).to.be.an('number')
      expect(progress.fileCount).to.be.an('number')
    }).on('end', function () {
      expect(once).to.be.true
      done()
    })
  })

  it('should create an archive of correct size', function (done) {
    const archive = `${tmpDir}/size.7z`
    const source = `${mockDir}/DirHex/`
    const seven = add(archive, source)
    seven.on('end', function () {
      const size = statSync(archive).size
      expect(size).to.greaterThan(400)
      expect(existsSync(archive)).to.be.true
      done()
    })
  })

  it('should get info from headers and footers', function (done) {
    const archive = `${tmpDir}/headers-and-footers.7z`
    const source = `${mockDir}/DirHex/`
    const seven = add(archive, source)
    seven.on('end', function () {
      // headers
      expect(seven.info['Creating archive']).to.equal(archive)
      expect(seven.info['Items to compress']).to.equal('30')
      // footers
      expect(seven.info['Files read from disk']).to.equal('24')
      expect(seven.info['Archive size']).to.be.a('string')
      done()
    })
  })

  it('should emit files on progress', function (done) {
    const archive = `${tmpDir}/files.7z`
    const source = `${mockDir}/DirHex/`
    const seven = add(archive, source, { bs: ['p1'] })
    seven.on('data', function (data) {
      expect(data.symbol).to.equal('+')
      expect(data.file).to.be.a('string')
      try { kill(seven._childProcess.pid) } catch (e) {}
    }).on('end', () => done())
  })

  it('should accept multiple sources as a array', function (done) {
    const archive = `${tmpDir}/txt-and-md-only.7z`
    const source = [
      `${mockDir}/DirExt/*.txt`,
      `${mockDir}/DirExt/*.md`
    ]
    const seven = add(archive, source, {
      r: true
    })
    seven.on('end', function () {
      expect(seven.info['Items to compress']).to.equal('6')
      expect(seven.info['Files read from disk']).to.equal('6')
      done()
    })
  })

  it('should add files to an exsiting archive', function (done) {
    // This test relies on a predecessor test
    const archive = `${tmpDir}/files.7z`
    const source = [
      `${mockDir}/DirExt/*.txt`,
      `${mockDir}/DirExt/*.md`
    ]
    const seven = add(archive, source, {
      r: true
    })
    seven.on('data', function (data) {
      expect(data.symbol).to.equal('+')
      expect(data.file).to.be.a('string')
    }).on('end', function () {
      expect(seven.info['Open archive']).to.equal(archive)
      expect(seven.info['Updating archive']).to.equal(archive)
      expect(seven.info['Items to compress']).to.equal('6')
      expect(seven.info['Files read from disk']).to.equal('6')
      expect(seven.info['Archive size']).to.be.a('string')
      done()
    })
  })

  it('should update files of an exsiting archive', function (done) {
    // This test relies on a predecessor test
    const archive = `${tmpDir}/files.7z`
    const source = [
      `${mockDir}/DirExtUpdate/*.txt`,
      `${mockDir}/DirExtUpdate/*.md`
    ]
    const seven = add(archive, source)
    seven.on('data', function (data) {
      expect(data.symbol).to.equal('U')
      expect(data.file).to.be.a('string')
    }).on('end', function () {
      expect(seven.info['Open archive']).to.equal(archive)
      expect(seven.info['Updating archive']).to.equal(archive)
      expect(seven.info['Items to compress']).to.equal('2')
      expect(seven.info['Files read from disk']).to.equal('2')
      expect(seven.info['Archive size']).to.be.a('string')
      done()
    })
  })
})
