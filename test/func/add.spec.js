/* global describe, it, before, beforeEach, after, afterEach */
import { expect } from 'chai'
import { existsSync, statSync } from 'fs'
import { sync as rimraf } from 'rimraf'
import kill from 'tree-kill'
import { add } from '../../lib/commands.js'

const mockDir = './test/_mock'
const tmpDir = './test/_tmp'

describe('Functional: add()', function () {
  // it('should emit files on processing', function (done) {
  //   const mockChildProcess = new EventEmitter()
  //   mockChildProcess.stdout = createReadStream('./test/_mock/DirNew/NewArchive.stdout.txt')
  //   mockChildProcess.stderr = new EventEmitter()
  //   const seven = add(`${mockDir}/DirNew/NewArchive.7z`, `${mockDir}/DirHex`, {
  //     $defer: true,
  //     $childProcess: mockChildProcess
  //   })
  //   let fileCount = 0
  //   seven.on('data', function (file) {
  //     expect(file.symbol).to.equal('+')
  //     expect(file.file).to.be.an('string')
  //     fileCount++
  //   }).on('end', function () {
  //     // DirHex/ contains 3 folder with each 8 files, + persky .DS_Store
  //     expect(fileCount).to.equal(8 * 3 + 1)
  //     done()
  //   })
  // })

  before(function (done) {
    rimraf('*/**/.DS_Store')
    done()
  })

  after(function (done) {
    rimraf(`${tmpDir}/*`)
    done()
  })

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
      try { kill(seven._childProcess.pid) } catch (e) {}
    })
  })

  it('should emit progress values', function (done) {
    const archive = `${tmpDir}/progress.7z`
    const source = `${mockDir}/DirImages/`
    const seven = add(archive, source, { bs: ['p1'] })
    seven.on('progress', function (progress) {
      expect(progress.percent).to.be.an('number')
      expect(progress.fileCount).to.be.an('number')
      try { kill(seven._childProcess.pid) } catch (e) {}
    }).on('end', () => done())
  })

  it('should create an archive of correct size', function (done) {
    const archive = `${tmpDir}/size.7z`
    const source = `${mockDir}/DirHex/`
    const seven = add(archive, source)
    seven.on('end', function () {
      const size = statSync(archive).size
      expect(size).to.equal(427)
      expect(existsSync(archive)).to.be.true
      done()
      try { kill(seven._childProcess.pid) } catch (e) {}
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
      expect(seven.info['Archive size']).to.equal('427 bytes (1 KiB)')
      done()
      try { kill(seven._childProcess.pid) } catch (e) {}
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

  it.only('should accept multiple sources as a array', function (done) {
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
})
