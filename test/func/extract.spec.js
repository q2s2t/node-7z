/* global describe, it, before, before */
import { expect } from 'chai'
import { copyFileSync, readdirSync } from 'fs'
import { extract } from '../../src/commands.js'
import { getAlternateBinByPlatform } from '../helper.js'
import { normalize } from 'path'

const mockDir = './test/_mock'
const tmpDir = './test/_tmp'

describe('Functional: extract()', function () {
  before(function () {
    getAlternateBinByPlatform()
  })

  it('should emit error on 7z error', function (done) {
    const seven = extract()
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
    const seven = extract(archive, target, undefined, { $bin: bin })
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
    const seven = extract('archive.7z', 'this/path/is/better', undefined, {
      o: 'than/this/path',
      $defer: true
    })
    expect(seven._args).to.contain('-othis/path/is/better')
    expect(seven._args).not.to.contain('-othan/this/path')
  })

  it('should set default 7zip ouptut when non or falsy', function () {
    const sevenUndefined = extract('archive.7z', 'output', undefined, { $defer: true })
    const sevenFalse = extract('archive.7z', 'output', false, { $defer: true })
    const sevenNull = extract('archive.7z', 'output', null, { $defer: true })
    const sevenEmptyString = extract('archive.7z', 'output', '', { $defer: true })
    expect(sevenUndefined._args).not.to.contain('-o')
    expect(sevenFalse._args).not.to.contain('-o')
    expect(sevenNull._args).not.to.contain('-o')
    expect(sevenEmptyString._args).not.to.contain('-o')
  })

  it('should set default 7zip target when non or falsy', function () {
    const sevenUndefined = extract('archive.7z', undefined, undefined, { $defer: true })
    const sevenFalse = extract('archive.7z', false, undefined, { $defer: true })
    const sevenNull = extract('archive.7z', null, undefined, { $defer: true })
    const sevenEmptyString = extract('archive.7z', '', undefined, { $defer: true })
    sevenUndefined._args.forEach(v => expect(v).not.to.match(/(^-o.)/))
    sevenFalse._args.forEach(v => expect(v).not.to.match(/(^-o.)/))
    sevenNull._args.forEach(v => expect(v).not.to.match(/(^-o.)/))
    sevenEmptyString._args.forEach(v => expect(v).not.to.match(/(^-o.)/))
  })

  it('should single accept target as a string', function () {
    const seven = extract('archive.7z', undefined, 'target1', { $defer: true })
    expect(seven._args).to.contain('target1')
  })

  it('should multiple accept target as a flat array', function () {
    const seven = extract('archive.7z', undefined, ['target1', 'target2'], { $defer: true })
    expect(seven._args).to.contain('target1')
    expect(seven._args).to.contain('target2')
  })

  it('should extract on the right path', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/extract-flat-exist.7z`
    const output = `${tmpDir}/extract-flat-exist`
    copyFileSync(archiveBase, archive)
    const seven = extract(archive, output, false, { r: true })
    seven.on('end', function () {
      expect(seven.info.get('Files')).to.equal('9')
      expect(seven.info.get('Folders')).to.equal('3')
      const ls = readdirSync(output)
      expect(ls).to.contain(normalize('DirExt'))
      expect(ls).to.contain(normalize('DirExt'))
      expect(ls).to.contain(normalize('root.md'))
      expect(ls).to.contain(normalize('root.not'))
      expect(ls).to.contain(normalize('root.txt'))
      expect(ls).to.contain(normalize('sub1'))
      expect(ls).to.contain(normalize('sub1.md'))
      expect(ls).to.contain(normalize('sub1.not'))
      expect(ls).to.contain(normalize('sub1.txt'))
      expect(ls).to.contain(normalize('sub2'))
      expect(ls).to.contain(normalize('sub2.md'))
      expect(ls).to.contain(normalize('sub2.not'))
      expect(ls).to.contain(normalize('sub2.txt'))
      done()
    })
  })

  it('should emit progress', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/extract-flat-progress.7z`
    const output = `${tmpDir}/extract-flat-progress`
    copyFileSync(archiveBase, archive)
    let once = false
    const seven = extract(archive, output, false, { r: true, bs: ['p1'] })
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
    const archive = `${tmpDir}/extract-flat-data.7z`
    const output = `${tmpDir}/extract-flat-data`
    copyFileSync(archiveBase, archive)
    let counter = 0
    const seven = extract(archive, output, false, { r: true })
    seven.on('data', function (data) {
      ++counter
      expect(data.symbol).to.be.equal('-')
      expect(data.file).to.be.an('string')
    }).on('end', function () {
      expect(counter).to.be.equal(12)
      done()
    })
  })

  it('should work with atlernate $bin', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/extract-flat-exist-path.7z`
    const output = `${tmpDir}/extract-flat-exist-path`
    copyFileSync(archiveBase, archive)
    const seven = extract(archive, output, false, {
      r: true,
      $bin: `${tmpDir}/Seven Zip`
    })
    seven.on('end', function () {
      expect(seven.info.get('Files')).to.equal('9')
      expect(seven.info.get('Folders')).to.equal('3')
      const ls = readdirSync(output)
      expect(ls).to.contain(normalize('DirExt'))
      expect(ls).to.contain(normalize('DirExt'))
      expect(ls).to.contain(normalize('root.md'))
      expect(ls).to.contain(normalize('root.not'))
      expect(ls).to.contain(normalize('root.txt'))
      expect(ls).to.contain(normalize('sub1'))
      expect(ls).to.contain(normalize('sub1.md'))
      expect(ls).to.contain(normalize('sub1.not'))
      expect(ls).to.contain(normalize('sub1.txt'))
      expect(ls).to.contain(normalize('sub2'))
      expect(ls).to.contain(normalize('sub2.md'))
      expect(ls).to.contain(normalize('sub2.not'))
      expect(ls).to.contain(normalize('sub2.txt'))
      done()
    })
  })
})
