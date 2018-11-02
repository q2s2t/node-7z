/* global describe, it */
import { expect } from 'chai'
import { hash } from '../../src/commands.js'

const mockDir = './test/_mock'

describe('Functional: hash()', function () {
  it('should return an error on 7z error', function (done) {
    const target = '/i/hope/this/is/not/where/your/archive/is'
    const seven = hash(target)
    seven.on('error', function (err) {
      expect(err).to.be.an.instanceof(Error)
      done()
    })
  })

  it('should return an error on spawn error', function (done) {
    const bin = '/i/hope/this/is/not/where/yout/7zip/bin/is'
    // or this test will fail
    const seven = hash(undefined, {
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

  it('should set default 7zip target when non or falsy', function () {
    const sevenUndefined = hash(undefined, { $defer: true })
    const sevenFalse = hash(false, { $defer: true })
    const sevenNull = hash(null, { $defer: true })
    const sevenEmptyString = hash('', { $defer: true })
    expect(sevenUndefined._args).not.to.contain(undefined)
    expect(sevenFalse._args).not.to.contain(false)
    expect(sevenNull._args).not.to.contain(null)
    expect(sevenEmptyString._args).not.to.contain('')
  })

  it('should single accept target as string', function () {
    const seven = hash('target1', { $defer: true })
    expect(seven._args).to.contain('target1')
  })

  it('should multiple accept target as array', function () {
    const seven = hash(['target1', 'target2'], { $defer: true })
    expect(seven._args).to.contain('target1')
    expect(seven._args).to.contain('target2')
  })

  it('should hash the right values', function (done) {
    const seven = hash([`${mockDir}/DirExt/sub1/`], { r: true })
    let hashes = []
    seven.on('data', (d) => hashes.push(d))
    seven.on('end', function () {
      expect(hashes).to.deep.include({ hash: undefined, size: NaN, file: 'sub1' })
      expect(hashes).to.deep.include({ hash: 'FEDC304F', size: 9, file: 'sub1/sub1.txt' })
      expect(hashes).to.deep.include({ hash: 'FEDC304F', size: 9, file: 'sub1/sub1.not' })
      expect(hashes).to.deep.include({ hash: 'FEDC304F', size: 9, file: 'sub1/sub1.md' })
      expect(seven.info.get('CRC32  for data and names')).to.equal('2363C80A')
      done()
    })
  })

  it('should emit progress values', function (done) {
    let once = false
    const seven = hash(`${mockDir}/*.jpg`, { r: true, bs: ['p1'] })
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
    let once = false
    const seven = hash(`${mockDir}/clouds*.jpg`, { r: true, bs: ['p1'] })
    seven.on('data', function (data) {
      once = true
      expect(data.hash).to.be.a('string')
      expect(data.file).to.be.a('string')
      expect(data.size).to.be.a('number')
    }).on('end', function () {
      expect(once).to.be.equal(true)
      done()
    })
  })

  it('should work with atlernate $path', function (done) {
    const seven = hash([`${mockDir}/DirExt/sub1/`], {
      r: true,
      $path: `${mockDir}/Seven Zip`
    })
    let hashes = []
    seven.on('data', (d) => hashes.push(d))
    seven.on('end', function () {
      expect(hashes).to.deep.include({ hash: undefined, size: NaN, file: 'sub1' })
      expect(hashes).to.deep.include({ hash: 'FEDC304F', size: 9, file: 'sub1/sub1.txt' })
      expect(hashes).to.deep.include({ hash: 'FEDC304F', size: 9, file: 'sub1/sub1.not' })
      expect(hashes).to.deep.include({ hash: 'FEDC304F', size: 9, file: 'sub1/sub1.md' })
      expect(seven.info.get('CRC32  for data and names')).to.equal('2363C80A')
      done()
    })
  })
})
