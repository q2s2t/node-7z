/* global describe, it */
import { expect } from 'chai'
import { matchProgress, matchProps } from '../../lib/parser.js'

describe('Specification: parser.js', function () {
  it('matchProgress() should return undefined on non match', function () {
    const r = matchProgress('Colon info: type colon info')
    expect(r).to.equal(undefined)
  })

  it('matchProgress() should return undefined on pseudo-empty line', function () {
    const r = matchProgress('    ')
    expect(r).to.be.equal(undefined)
  })

  it('matchProgress() should return progress info as int', function () {
    const digit1File = matchProgress('  1% 3')
    expect(digit1File.percent).to.equal(1)
    expect(digit1File.fileCount).to.equal(3)

    const digit2File = matchProgress(' 42% 234')
    expect(digit2File.percent).to.equal(42)
    expect(digit2File.fileCount).to.equal(234)

    const digit3File = matchProgress('100% 23877')
    expect(digit3File.percent).to.equal(100)
    expect(digit3File.fileCount).to.equal(23877)

    const digit1NoFile = matchProgress('  1%')
    expect(digit1NoFile.percent).to.equal(1)

    const digit2NoFile = matchProgress(' 42%')
    expect(digit2NoFile.percent).to.equal(42)

    const digit3NoFile = matchProgress('100%')
    expect(digit3NoFile.percent).to.equal(100)
  })

  it('matchProgress() should return file on add', function () {
    const r = matchProgress('+ test/file')
    expect(r).to.be.an('object')
    expect(r['symbol']).to.equal('+')
    expect(r['file']).to.equal('test/file')
  })

  it('matchProgress() should return file on update', function () {
    const r = matchProgress('U test/file')
    expect(r).to.be.an('object')
    expect(r['symbol']).to.equal('U')
    expect(r['file']).to.equal('test/file')
  })

  it('matchProgress() should return file on test', function () {
    const r = matchProgress('T test/file')
    expect(r).to.be.an('object')
    expect(r['symbol']).to.equal('T')
    expect(r['file']).to.equal('test/file')
  })

  it('matchProgress() should return file on remaining', function () {
    const r = matchProgress('R test/file')
    expect(r).to.be.an('object')
    expect(r['symbol']).to.equal('R')
    expect(r['file']).to.equal('test/file')
  })

  it('matchProgress() should return file on delete', function () {
    const r = matchProgress('. test/file')
    expect(r).to.be.an('object')
    expect(r['symbol']).to.equal('.')
    expect(r['file']).to.equal('test/file')
  })

  it('matchProgress() should return file on extracted', function () {
    const r = matchProgress('- test/file')
    expect(r).to.be.an('object')
    expect(r['symbol']).to.equal('-')
    expect(r['file']).to.equal('test/file')
  })

  it('matchProgress() should return file on Windows drive', function () {
    const r = matchProgress('+ C:\\test\\file')
    expect(r).to.be.an('object')
    expect(r['symbol']).to.equal('+')
    expect(r['file']).to.equal('C:\\test\\file')
  })

  it('matchProgress() should return file on Windows remote', function () {
    const r = matchProgress('+ \\test\\file')
    expect(r).to.be.an('object')
    expect(r['symbol']).to.equal('+')
    expect(r['file']).to.equal('\\test\\file')
  })

  it('matchProgress() should return file with emoji☕️', function () {
    const r = matchProgress('T test/f☕️le')
    expect(r).to.be.an('object')
    expect(r['symbol']).to.equal('T')
    expect(r['file']).to.equal('test/f☕️le')
  })

  it('matchProgress() should parse files with or without progress', function () {
    const case1 = `  0%\x08\x08\x08\x08    \x08\x08\x08\x08+ DirImages/LICENSE`
    const case2 = ` 29% 4\x08\x08\x08\x08      \x08\x08\x08\x08 36% 4\x08\x08\x08\x08      \x08\x08\x08\x08 40% 4\x08\x08\x08\x08      \x08\x08\x08\x08+ DirImages/architecture-art-colorful-161154.jpg`
    const case3 = `+ DirImages/LICENSE`
    const r1 = matchProgress(case1)
    const r2 = matchProgress(case2)
    const r3 = matchProgress(case3)
    expect(r1.percent).to.equal(0)
    expect(r1.symbol).to.equal('+')
    expect(r1.file).to.equal('DirImages/LICENSE')
    expect(r2.percent).to.equal(40)
    expect(r2.fileCount).to.equal(4)
    expect(r2.symbol).to.equal('+')
    expect(r2.file).to.equal('DirImages/architecture-art-colorful-161154.jpg')
    expect(r3.symbol).to.equal('+')
    expect(r3.file).to.equal('DirImages/LICENSE')
  })

  it('matchProps() should return null on non match', function () {
    const r = matchProps('+ test/file/null')
    expect(r).to.equal(null)
  })

  it('matchProps() should return props and values', function () {
    const basic = matchProps('Prop: Data')
    expect(basic).to.be.an('array')
    expect(basic).to.have.lengthOf(1)
    expect(basic[0]['Prop']).to.equal('Data')

    const space = matchProps('Prop of archive: 322 MB')
    expect(space).to.be.an('array')
    expect(space).to.have.lengthOf(1)
    expect(space[0]['Prop of archive']).to.equal('322 MB')
  })

  it('matchProps() should works with line containing 2 infos', function () {
    const basic = matchProps('Prop1: Data1,  # Prop2: Data2')
    expect(basic).to.be.an('array')
    expect(basic).to.have.lengthOf(2)
    expect(basic[0]['Prop1']).to.equal('Data1')
    expect(basic[1]['Prop2']).to.equal('Data2')

    const space = matchProps('Prop 1: Data 1,  # Prop 2: Data 2')
    expect(space).to.be.an('array')
    expect(space).to.have.lengthOf(2)
    expect(space[0]['Prop 1']).to.equal('Data 1')
    expect(space[1]['Prop 2']).to.equal('Data 2')
  })

  it('matchProps() should return null on non match', function () {
    const r = matchProps('+ test/file/null')
    expect(r).to.be.equal(null)
  })

  it('matchProps() should return props and values', function () {
    const basic = matchProps('Prop = Data')
    expect(basic).to.be.an('array')
    expect(basic).to.have.lengthOf(1)
    expect(basic[0]['Prop']).to.equal('Data')

    const space = matchProps('Prop of archive = 322 MB')
    expect(space).to.be.an('array')
    expect(space).to.have.lengthOf(1)
    expect(space[0]['Prop of archive']).to.equal('322 MB')
  })

  it('matchProps() should get props of values with colon', function () {
    const equalFirst = matchProps('Equal first = True but:this = is valid val')
    expect(equalFirst).to.be.an('array')
    expect(equalFirst).to.have.lengthOf(1)
    expect(equalFirst[0]['Equal first']).to.equal('True but:this = is valid val')
  })

  it('matchProps() should get props of values with equal', function () {
    const colonFirst = matchProps('Colon first: True but:this = is valid val')
    expect(colonFirst).to.be.an('array')
    expect(colonFirst).to.have.lengthOf(1)
    expect(colonFirst[0]['Colon first']).to.equal('True but:this = is valid val')
  })
})
