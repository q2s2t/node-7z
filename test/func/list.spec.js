/* global describe, it */
import { expect } from 'chai'
import { copyFileSync } from 'fs'
import { list } from '../../src/commands.js'

const mockDir = './test/_mock'
const tmpDir = './test/_tmp'

describe('Functional: list()', function () {
  it('should return an error on 7z error', function (done) {
    const archive = '/i/hope/this/is/not/where/your/archive/is'
    const seven = list(archive)
    seven.on('error', function (err) {
      expect(err).to.be.an.instanceof(Error)
      done()
    })
  })

  it('should return an error on spawn error', function (done) {
    const bin = '/i/hope/this/is/not/where/yout/7zip/bin/is'
    const seven = list('archive', undefined, {
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

  it('should set headers and footers infos', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/list-header-footer.7z`
    copyFileSync(archiveBase, archive)
    const seven = list(archive, undefined, { r: true })
    seven.on('end', function () {
      expect(seven.info.get('Physical Size')).to.equal('290')
      expect(seven.info.get('Type')).to.equal('7z')
      done()
    })
  })

  it('should single accept target as string', function () {
    const seven = list('archive.7z', 'target1', { $defer: true })
    expect(seven._args).to.contain('target1')
  })

  it('should multiple accept target as array', function () {
    const seven = list('archive.7z', ['target1', 'target2'], { $defer: true })
    expect(seven._args).to.contain('target1')
    expect(seven._args).to.contain('target2')
  })

  it('should accept target and give the good values', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/list-exist.7z`
    copyFileSync(archiveBase, archive)
    const seven = list(archive, '*.txt', { r: true })
    const data = []
    const expectedData = [
      { datetime: new Date('2018-10-13T09:29:26.000Z'),
        attributes: '....A',
        size: 9,
        sizeCompressed: undefined,
        file: 'DirExt/root.txt' },
      { datetime: new Date('2018-10-13T09:28:52.000Z'),
        attributes: '....A',
        size: 9,
        sizeCompressed: undefined,
        file: 'DirExt/sub1/sub1.txt' },
      { datetime: new Date('2018-10-13T09:29:39.000Z'),
        attributes: '....A',
        size: 9,
        sizeCompressed: undefined,
        file: 'DirExt/sub2/sub2.txt' }
    ]
    seven.on('data', d => data.push(d))
    seven.on('end', function () {
      expect(data).to.deep.equal(expectedData)
      done()
    })
  })

  it('should emit files on progress', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/list-data.7z`
    copyFileSync(archiveBase, archive)
    let counter = 0
    const seven = list(archive, undefined, { r: true })
    seven.on('data', function (data) {
      ++counter
      expect(data.file).to.be.a('string')
    }).on('end', function () {
      expect(counter).to.be.equal(12)
      done()
    })
  })

  it('should work with atlernate $path', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/list-path.7z`
    copyFileSync(archiveBase, archive)
    let counter = 0
    const seven = list(archive, undefined, {
      r: true,
      $path: `${mockDir}/Seven Zip`
    })
    seven.on('data', function (data) {
      ++counter
      expect(data.file).to.be.a('string')
    }).on('end', function () {
      expect(counter).to.be.equal(12)
      done()
    })
  })
})
