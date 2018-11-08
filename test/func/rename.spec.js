/* global describe, it */
import { expect } from 'chai'
import { rename } from '../../src/commands.js'
import { copyFileSync } from 'fs'

const mockDir = './test/_mock'
const tmpDir = './test/_tmp'

describe('Functional: rename()', function () {
  it('should emit error on 7z error', function (done) {
    const seven = rename('', [])
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
    const seven = rename(archive, target, { $bin: bin })
    seven.on('error', function (err) {
      expect(err).to.be.an.instanceof(Error)
      expect(err.errno).to.equal('ENOENT')
      expect(err.code).to.equal('ENOENT')
      expect(err.syscall).to.equal(`spawn ${bin}`)
      expect(err.path).to.equal(bin)
      done()
    })
  })

  it('should accept single target as flat array', function () {
    const seven = rename('archive', ['src', 'dest'], { $defer: true })
    expect(seven._args).to.deep.equal([
      'rn', 'archive',
      'src', 'dest',
      '-y', '-bb3'
    ])
  })

  it('should multiple accept target as nested array', function () {
    const seven = rename('archive', [
      ['src1', 'dest1'],
      ['src2', 'dest2'],
      ['src3', 'dest3']
    ], { $defer: true })
    expect(seven._args).to.deep.equal([
      'rn', 'archive',
      'src1', 'dest1', 'src2', 'dest2', 'src3', 'dest3',
      '-y', '-bb3'
    ])
  })

  it('should set headers and footers infos', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/rename-headers-footers.7z`
    copyFileSync(archiveBase, archive)
    const seven = rename(archive, ['DirExt/sub1', 'DirExt/renamed'], { r: true })
    seven.on('end', function () {
      expect(seven.info.get('Physical Size')).to.equal('290')
      expect(seven.info.get('Archive size')).to.equal('302 bytes (1 KiB)')
      done()
    })
  })

  it('should emit data', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/rename-data.7z`
    copyFileSync(archiveBase, archive)
    let counter = 0
    const seven = rename(archive, ['DirExt/sub1', 'DirExt/renamed'], { r: true })
    seven.on('data', function (data) {
      ++counter
      expect(data.symbol).to.be.equal('=')
      expect(data.file).to.be.an('string')
    }).on('end', function () {
      expect(counter).to.be.equal(10)
      done()
    })
  })

  it('should emit progress', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/rename-progress.7z`
    copyFileSync(archiveBase, archive)
    let once = false
    const seven = rename(archive, ['DirExt/sub1', 'DirExt/renamed'], {
      r: true,
      bs: ['p1']
    })
    seven.on('progress', function (progress) {
      once = true
      expect(progress.percent).to.be.an('number')
      expect(progress.fileCount).to.be.an('number')
    }).on('end', function () {
      expect(once).to.equal(true)
      done()
    })
  })

  it('should work with atlernate $path', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/rename-path.7z`
    copyFileSync(archiveBase, archive)
    let counter = 0
    const seven = rename(archive, ['DirExt/sub1', 'DirExt/renamed'], {
      r: true,
      $path: `${mockDir}/Seven Zip`
    })
    seven.on('data', function (data) {
      ++counter
      expect(data.symbol).to.be.equal('=')
      expect(data.file).to.be.an('string')
    }).on('end', function () {
      expect(counter).to.be.equal(10)
      done()
    })
  })
})
