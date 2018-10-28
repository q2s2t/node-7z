/* global describe, it */
import { expect } from 'chai'
import { copyFileSync, readdirSync, lchmod } from 'fs'
import { hash } from '../../lib/commands.js'

const mockDir = './test/_mock'
const tmpDir = './test/_tmp'

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

  it('should hash', function (done) {
    const seven = hash([`${mockDir}/*.jpg`, `${mockDir}/*.txt`], {
      r: true,
      bs: ['p1']
    })
    seven.on('data', function (data) {
      // console.log('data: ', data)
    })
    seven.on('progress', function (progress) {
      // console.log('progress: ', progress)
    })
    seven.on('end', function () {
      expect(seven.info['Files']).to.equal('33')
      expect(seven.info['Size']).to.equal('18616384')
      expect(seven.info['CRC32  for data']).to.equal('C625C978')
      expect(seven.info['CRC32  for data and names']).to.equal('EBD02AD2')
      done()
    })
  })

  // it('should set default 7zip target when non or falsy', function () {
  //   const sevenUndefined = extract('archive.7z', undefined, undefined, { $defer: true })
  //   const sevenFalse = extract('archive.7z', null, undefined, { $defer: true })
  //   const sevenNull = extract('archive.7z', false, undefined, { $defer: true })
  //   const sevenEmptyString = extract('archive.7z', '', undefined, { $defer: true })
  //   sevenUndefined._args.forEach(v => expect(v).not.to.match(/(^-o.)/))
  //   sevenFalse._args.forEach(v => expect(v).not.to.match(/(^-o.)/))
  //   sevenNull._args.forEach(v => expect(v).not.to.match(/(^-o.)/))
  //   sevenEmptyString._args.forEach(v => expect(v).not.to.match(/(^-o.)/))
  // })

  // it('should single accept target as string', function () {
  //   const seven = extract('archive.7z', undefined, 'target1', { $defer: true })
  //   expect(seven._args).to.contain('target1')
  // })

  // it('should multiple accept target as array', function () {
  //   const seven = extract('archive.7z', undefined, ['target1', 'target2'], { $defer: true })
  //   expect(seven._args).to.contain('target1')
  //   expect(seven._args).to.contain('target2')
  // })

  // it('should extract on the right path', function (done) {
  //   const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
  //   const archive = `${tmpDir}/extract-flat-exist.7z`
  //   const output = `${tmpDir}/extract-flat-exist`
  //   copyFileSync(archiveBase, archive)
  //   const seven = extract(archive, output, false, { r: true })
  //   seven.on('end', function () {
  //     expect(seven.info['Files']).to.equal('9')
  //     expect(seven.info['Folders']).to.equal('3')
  //     expect(seven.info['Path']).to.equal(archive)
  //     const ls = readdirSync(output)
  //     expect(ls).to.contain('DirExt')
  //     expect(ls).to.contain('DirExt')
  //     expect(ls).to.contain('root.md')
  //     expect(ls).to.contain('root.not')
  //     expect(ls).to.contain('root.txt')
  //     expect(ls).to.contain('sub1')
  //     expect(ls).to.contain('sub1.md')
  //     expect(ls).to.contain('sub1.not')
  //     expect(ls).to.contain('sub1.txt')
  //     expect(ls).to.contain('sub2')
  //     expect(ls).to.contain('sub2.md')
  //     expect(ls).to.contain('sub2.not')
  //     expect(ls).to.contain('sub2.txt')
  //     done()
  //   })
  // })

  // it('should emit progress values', function (done) {
  //   const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
  //   const archive = `${tmpDir}/extract-flat-progress.7z`
  //   const output = `${tmpDir}/extract-flat-progress`
  //   copyFileSync(archiveBase, archive)
  //   let once = false
  //   const seven = extract(archive, output, false, { r: true, bs: ['p1'] })
  //   seven.on('progress', function (progress) {
  //     once = true
  //     expect(progress.percent).to.be.an('number')
  //     expect(progress.fileCount).to.be.an('number')
  //   }).on('end', function () {
  //     expect(once).to.be.equal(true)
  //     done()
  //   })
  // })

  // it('should emit files on progress', function (done) {
  //   const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
  //   const archive = `${tmpDir}/extract-flat-data.7z`
  //   const output = `${tmpDir}/extract-flat-data`
  //   copyFileSync(archiveBase, archive)
  //   let once = false
  //   const seven = extract(archive, output, false, { r: true })
  //   seven.on('data', function (data) {
  //     once = true
  //     expect(data.symbol).to.be.equal('-')
  //     expect(data.file).to.be.an('string')
  //   }).on('end', function () {
  //     expect(once).to.be.equal(true)
  //     done()
  //   })
  // })
})
