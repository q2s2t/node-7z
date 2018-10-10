/* global describe, it, before, beforeEach, after, afterEach */
import { expect } from 'chai'
import { existsSync, statSync } from 'fs'
import { sync as rimraf } from 'rimraf'
import { add } from '../../lib/commands.js'

const mockDir = './test/_mock'
const tmpDir = './test/_tmp'

describe('Functional: add()', function () {
  // it('should emit progress values', function (done) {
  //   const mockChildProcess = new EventEmitter()
  //   mockChildProcess.stdout = createReadStream('./test/_mock/DirNew/NewArchive.stdout.txt')
  //   mockChildProcess.stderr = new EventEmitter()
  //   const seven = add(`${mockDir}/DirNew/NewArchive.7z`, `${mockDir}/DirHex`, {
  //     $defer: true,
  //     $childProcess: mockChildProcess
  //   })
  //   seven.on('progress', function (progress) {
  //     expect(progress.percent).to.be.an('number')
  //     expect(progress.fileCount).to.be.an('number')
  //   }).on('end', function () {
  //     done()
  //   })
  // })

  // it('should get info from headers and footers', function (done) {
  //   const mockChildProcess = new EventEmitter()
  //   mockChildProcess.stdout = createReadStream('./test/_mock/DirNew/NewArchive.stdout.txt')
  //   mockChildProcess.stderr = new EventEmitter()
  //   const seven = add(`${mockDir}/DirNew/NewArchive.7z`, `${mockDir}/DirHex`, {
  //     $defer: true,
  //     $childProcess: mockChildProcess
  //   })
  //   seven.on('end', function () {
  //     // headers
  //     expect(seven.info['Open archive']).to.equal('DirNew/NewArchive.7z')
  //     expect(seven.info['Items to compress']).to.equal('31')
  //     // footers
  //     expect(seven.info['Files read from disk']).to.equal('25')
  //     expect(seven.info['Archive size']).to.equal('656 bytes (1 KiB)')
  //     done()
  //   })
  // })

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
    rimraf(`${tmpDir}/*`)
    done()
  })

  afterEach(function (done) {
    rimraf(`${tmpDir}/*`)
    done()
  })

  it('should emit progress values', function (done) {
    const archive = `${tmpDir}/progress.7z`
    const source = `${mockDir}/DirImages/`
    const seven = add(archive, source, { bs: ['p1'] })
    seven.on('progress', function (progress) {
      expect(progress.percent).to.be.an('number')
      expect(progress.fileCount).to.be.an('number')
    }).on('end', done())
  })

  it('should create an archive of correct size', function (done) {
    const archive = `${tmpDir}/size.7z`
    const source = `${mockDir}/DirHex`
    const seven = add(archive, source)
    seven.on('end', function () {
      const size = statSync(archive).size
      expect(size).to.equal(427)
      expect(existsSync(archive)).to.be.true
      done()
    })
  })
})
