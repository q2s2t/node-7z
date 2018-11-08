/* global describe, it */
import { expect } from 'chai'
import { copyFileSync } from 'fs'
import { update } from '../../src/commands.js'

const mockDir = './test/_mock'
const tmpDir = './test/_tmp'

describe('Functional: update()', function () {
  it('should emit error on 7z error', function (done) {
    const seven = update('')
    seven.on('error', function (err) {
      expect(err).to.be.an.instanceof(Error)
      expect(err.message).to.be.a('string')
      expect(err.stderr).to.be.a('string')
      done()
    })
  })

  it('should emit error on spawn error', function (done) {
    const archive = ``
    const source = ``
    const bin = '/i/hope/this/is/not/where/your/7zip/bin/is'
    const seven = update(archive, source, { $bin: bin })
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
    const archiveBase = `${mockDir}/DirNew/BaseExt.7z`
    const archive = `${tmpDir}/update-progress.7z`
    const source = `${mockDir}/DirExtUpdate/*`
    copyFileSync(archiveBase, archive)
    const seven = update(archive, source, { r: true, bs: ['p1'] })
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
    const archiveBase = `${mockDir}/DirNew/BaseExt.7z`
    const archive = `${tmpDir}/update-data.7z`
    const source = `${mockDir}/DirExtUpdate/*`
    copyFileSync(archiveBase, archive)
    const seven = update(archive, source, { r: true })
    let counter = 0
    seven.on('data', function (data) {
      ++counter
      expect(data.symbol).to.equal('U')
      expect(data.file).to.be.a('string')
    }).on('end', function () {
      expect(counter).to.be.equal(3)
      done()
    })
  })

  it('should get info from headers and footers', function (done) {
    const archiveBase = `${mockDir}/DirNew/BaseExt.7z`
    const archive = `${tmpDir}/update-headers-footers.7z`
    const source = `${mockDir}/DirExtUpdate/*`
    copyFileSync(archiveBase, archive)
    const seven = update(archive, source, { r: true })
    seven.on('end', function () {
      // headers
      expect(seven.info.get('Open archive')).to.equal(archive)
      expect(seven.info.get('Method')).to.equal('LZMA2:12')
      // footers
      expect(seven.info.get('Files read from disk')).to.equal('3')
      done()
    })
  })

  it('should accept multiple targets as a string', function (done) {
    const archiveBase = `${mockDir}/DirNew/BaseExt.7z`
    const archive = `${tmpDir}/update-one-source.7z`
    const source = `${mockDir}/DirExtUpdate/*.txt`
    copyFileSync(archiveBase, archive)
    const seven = update(archive, source, { r: true })
    let dataAgg = []
    seven.on('data', d => dataAgg.push(d))
    seven.on('end', function () {
      expect(dataAgg).to.deep.include({ symbol: 'R', file: '#0' })
      expect(dataAgg).to.deep.include({ symbol: 'R', file: 'root.md' })
      expect(dataAgg).to.deep.include({ symbol: 'R', file: 'root.not' })
      expect(dataAgg).to.deep.include({ symbol: '.', file: 'root.txt' })
      expect(dataAgg).to.deep.include({ symbol: 'U', file: 'root.txt' })
      done()
    })
  })

  it('should accept multiple targets as a array', function (done) {
    const archiveBase = `${mockDir}/DirNew/BaseExt.7z`
    const archive = `${tmpDir}/update-one-source.7z`
    const source = [
      `${mockDir}/DirExtUpdate/*.txt`,
      `${mockDir}/DirExtUpdate/*.md`
    ]
    copyFileSync(archiveBase, archive)
    const seven = update(archive, source, { r: true })
    let dataAgg = []
    seven.on('data', d => dataAgg.push(d))
    seven.on('end', function () {
      expect(dataAgg).to.deep.include({ symbol: 'R', file: '#0' })
      expect(dataAgg).to.deep.include({ symbol: 'R', file: 'root.not' })
      expect(dataAgg).to.deep.include({ symbol: '.', file: 'root.md' })
      expect(dataAgg).to.deep.include({ symbol: 'U', file: 'root.md' })
      expect(dataAgg).to.deep.include({ symbol: '.', file: 'root.txt' })
      expect(dataAgg).to.deep.include({ symbol: 'U', file: 'root.txt' })
      done()
    })
  })
})
