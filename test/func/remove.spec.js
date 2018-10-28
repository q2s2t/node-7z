/* global describe, it */
import { expect } from 'chai'
import { copyFileSync, statSync } from 'fs'
import { remove as del } from '../../lib/commands.js'

const mockDir = './test/_mock'
const tmpDir = './test/_tmp'

describe('Functional: remove()', function () {
  it('should return an error on 7z error', function (done) {
    const archive = '/i/hope/this/is/not/where/your/archive/is'
    const source = `${mockDir}/dev/null`
    const seven = del(archive, source)
    seven.on('error', function (err) {
      expect(err).to.be.an.instanceof(Error)
      done()
    })
  })

  it('should return an error on spawn error', function (done) {
    const archive = ``
    const source = ``
    const bin = '/i/hope/this/is/not/where/yout/7zip/bin/is'
    // or this test will fail
    const seven = del(archive, source, {
      $bin: bin
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

  it('should reduce archive size by deleting content', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/del-md.7z`
    const target = `DirExt/*.md`
    copyFileSync(archiveBase, archive)
    const sizeBase = statSync(archiveBase).size
    const seven = del(archive, target, { r: true })
    seven.on('end', function () {
      const size = statSync(archive).size
      expect(size).to.lessThan(sizeBase)
      expect(seven.info.get('Updating archive')).to.equal(archive)
      done()
    })
  })

  it('should accept multiple sources as a array', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/del-multiple.7z`
    const target = [`DirExt/*.md`, `DirExt/*.txt`]
    copyFileSync(archiveBase, archive)
    const sizeBase = statSync(archiveBase).size
    const seven = del(archive, target, { r: true })
    seven.on('end', function () {
      const size = statSync(archive).size
      expect(size).to.lessThan(sizeBase)
      expect(seven.info.get('Updating archive')).to.equal(archive)
      done()
    })
  })

  it('should emit progress values', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/progress-del.7z`
    const target = `DirExt/*.md`
    copyFileSync(archiveBase, archive)
    const seven = del(archive, target, { bs: ['p1'] })
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

  it('should emit files on progress', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/progress-file-del.7z`
    const target = `DirExt/*.md`
    copyFileSync(archiveBase, archive)
    const seven = del(archive, target, { r: true })
    let counter = 0
    seven.on('data', function (progress) {
      ++counter
      expect(progress.symbol).to.be.an('string')
      expect(progress.file).to.be.an('string')
    }).on('end', function () {
      expect(counter).to.be.equal(10)
      done()
    })
  })
})
