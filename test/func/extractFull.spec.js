/* global describe, it */
import { expect } from 'chai'
import { copyFileSync } from 'fs'
import { extractFull } from '../../src/commands.js'
import readdirRecursiveSync from 'fs-readdir-recursive'

const mockDir = './test/_mock'
const tmpDir = './test/_tmp'

describe('Functional: extractFull()', function () {
  it('should return an error on 7z error', function (done) {
    const archive = '/i/hope/this/is/not/where/your/archive/is'
    const seven = extractFull(archive)
    seven.on('error', function (err) {
      expect(err).to.be.an.instanceof(Error)
      done()
    })
  })

  it('should return an error on spawn error', function (done) {
    const bin = '/i/hope/this/is/not/where/yout/7zip/bin/is'
    // or this test will fail
    const seven = extractFull('archive', undefined, undefined, {
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

  it('should overwrite -o switch with output argument', function () {
    const seven = extractFull('archive.7z', 'this/path/is/better', undefined, {
      o: 'than/this/path',
      $defer: true
    })
    expect(seven._args).to.contain('-othis/path/is/better')
    expect(seven._args).not.to.contain('-othan/this/path')
  })

  it('should set default 7zip ouptut when non or falsy', function () {
    const sevenUndefined = extractFull('archive.7z', 'output', undefined, { $defer: true })
    const sevenFalse = extractFull('archive.7z', 'output', false, { $defer: true })
    const sevenNull = extractFull('archive.7z', 'output', null, { $defer: true })
    const sevenEmptyString = extractFull('archive.7z', 'output', '', { $defer: true })
    expect(sevenUndefined._args).not.to.contain('-o')
    expect(sevenFalse._args).not.to.contain('-o')
    expect(sevenNull._args).not.to.contain('-o')
    expect(sevenEmptyString._args).not.to.contain('-o')
  })

  it('should set default 7zip target when non or falsy', function () {
    const sevenUndefined = extractFull('archive.7z', undefined, undefined, { $defer: true })
    const sevenFalse = extractFull('archive.7z', false, undefined, { $defer: true })
    const sevenNull = extractFull('archive.7z', null, undefined, { $defer: true })
    const sevenEmptyString = extractFull('archive.7z', '', undefined, { $defer: true })
    sevenUndefined._args.forEach(v => expect(v).not.to.match(/(^-o.)/))
    sevenFalse._args.forEach(v => expect(v).not.to.match(/(^-o.)/))
    sevenNull._args.forEach(v => expect(v).not.to.match(/(^-o.)/))
    sevenEmptyString._args.forEach(v => expect(v).not.to.match(/(^-o.)/))
  })

  it('should single accept target as string', function () {
    const seven = extractFull('archive.7z', undefined, 'target1', { $defer: true })
    expect(seven._args).to.contain('target1')
  })

  it('should multiple accept target as array', function () {
    const seven = extractFull('archive.7z', undefined, ['target1', 'target2'], { $defer: true })
    expect(seven._args).to.contain('target1')
    expect(seven._args).to.contain('target2')
  })

  it('should extractFull on the right path', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/extract-full-exist.7z`
    const output = `${tmpDir}/extract-full-exist`
    copyFileSync(archiveBase, archive)
    const seven = extractFull(archive, output, false, { r: true })
    seven.on('end', function () {
      expect(seven.info.get('Files')).to.equal('9')
      expect(seven.info.get('Folders')).to.equal('3')
      expect(seven.info.get('Path')).to.equal(archive)
      const ls = readdirRecursiveSync(output)
      expect(ls).to.contain('DirExt/root.md')
      expect(ls).to.contain('DirExt/root.not')
      expect(ls).to.contain('DirExt/root.txt')
      expect(ls).to.contain('DirExt/sub1/sub1.md')
      expect(ls).to.contain('DirExt/sub1/sub1.not')
      expect(ls).to.contain('DirExt/sub1/sub1.txt')
      expect(ls).to.contain('DirExt/sub2/sub2.md')
      expect(ls).to.contain('DirExt/sub2/sub2.not')
      expect(ls).to.contain('DirExt/sub2/sub2.txt')
      done()
    })
  })

  it('should emit progress values', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/extract-full-progress.7z`
    const output = `${tmpDir}/extract-full-progress`
    copyFileSync(archiveBase, archive)
    let once = false
    const seven = extractFull(archive, output, false, { r: true, bs: ['p1'] })
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
    const archive = `${tmpDir}/extract-full-data.7z`
    const output = `${tmpDir}/extract-full-data`
    copyFileSync(archiveBase, archive)
    let counter = 0
    const seven = extractFull(archive, output, false, { r: true })
    seven.on('data', function (data) {
      ++counter
      expect(data.symbol).to.be.equal('-')
      expect(data.file).to.be.an('string')
    }).on('end', function () {
      expect(counter).to.be.equal(12)
      done()
    })
  })

  it('should work with spaces', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/extractFull-full spaces anc special chars絵🤚🏽.7z`
    const output = `${tmpDir}/extract-full spaces anc special chars絵🤚🏽`
    copyFileSync(archiveBase, archive)
    const seven = extractFull(archive, output, false, { r: true })
    seven.on('end', function () {
      expect(seven.info.get('Files')).to.equal('9')
      expect(seven.info.get('Folders')).to.equal('3')
      expect(seven.info.get('Path')).to.equal(archive)
      const ls = readdirRecursiveSync(output)
      expect(ls).to.contain('DirExt/root.md')
      expect(ls).to.contain('DirExt/sub1/sub1.md')
      done()
    })
  })

  it('should work with atlernate $path', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/extractFull-full-path.7z`
    const output = `${tmpDir}/extract-full-path`
    copyFileSync(archiveBase, archive)
    const seven = extractFull(archive, output, false, {
      r: true,
      $path: `${mockDir}/Seven Zip`
    })
    seven.on('end', function () {
      expect(seven.info.get('Files')).to.equal('9')
      expect(seven.info.get('Folders')).to.equal('3')
      expect(seven.info.get('Path')).to.equal(archive)
      const ls = readdirRecursiveSync(output)
      expect(ls).to.contain('DirExt/root.md')
      expect(ls).to.contain('DirExt/sub1/sub1.md')
      done()
    })
  })
})
