/* global describe, it */
import { expect } from 'chai'
import { matchBodyProgress, matchBodySymbolFile, matchBodyHash, matchInfos } from '../../lib/parser.js'

describe('Unit: parser.js', function () {
  it('matchBodyProgress() should return null on non match', function () {
    const r = matchBodyProgress('Colon info: type colon info')
    expect(r).to.equal(null)
  })

  it('matchBodyProgress() should return null on pseudo-empty line', function () {
    const r = matchBodyProgress('    ')
    expect(r).to.be.equal(null)
  })

  it('matchBodyProgress() should return progress info as int', function () {
    const digit1File = matchBodyProgress('  1% 3')
    expect(digit1File.percent).to.equal(1)
    expect(digit1File.fileCount).to.equal(3)

    const digit2File = matchBodyProgress(' 42% 234')
    expect(digit2File.percent).to.equal(42)
    expect(digit2File.fileCount).to.equal(234)

    const digit3File = matchBodyProgress('100% 23877')
    expect(digit3File.percent).to.equal(100)
    expect(digit3File.fileCount).to.equal(23877)

    const digit1NoFile = matchBodyProgress('  1%')
    expect(digit1NoFile.percent).to.equal(1)

    const digit2NoFile = matchBodyProgress(' 42%')
    expect(digit2NoFile.percent).to.equal(42)

    const digit3NoFile = matchBodyProgress('100%')
    expect(digit3NoFile.percent).to.equal(100)
  })

  it('matchBodySymbolFile() should return file on add', function () {
    const r = matchBodySymbolFile('+ test/file')
    expect(r).to.be.an('object')
    expect(r['symbol']).to.equal('+')
    expect(r['file']).to.equal('test/file')
  })

  it('matchBodySymbolFile() should return file on update', function () {
    const r = matchBodySymbolFile('U test/file')
    expect(r).to.be.an('object')
    expect(r['symbol']).to.equal('U')
    expect(r['file']).to.equal('test/file')
  })

  it('matchBodySymbolFile() should return file on test', function () {
    const r = matchBodySymbolFile('T test/file')
    expect(r).to.be.an('object')
    expect(r['symbol']).to.equal('T')
    expect(r['file']).to.equal('test/file')
  })

  it('matchBodySymbolFile() should return file on remaining', function () {
    const r = matchBodySymbolFile('R test/file')
    expect(r).to.be.an('object')
    expect(r['symbol']).to.equal('R')
    expect(r['file']).to.equal('test/file')
  })

  it('matchBodySymbolFile() should return file on delete', function () {
    const r = matchBodySymbolFile('. test/file')
    expect(r).to.be.an('object')
    expect(r['symbol']).to.equal('.')
    expect(r['file']).to.equal('test/file')
  })

  it('matchBodySymbolFile() should return file on extracted', function () {
    const r = matchBodySymbolFile('- test/file')
    expect(r).to.be.an('object')
    expect(r['symbol']).to.equal('-')
    expect(r['file']).to.equal('test/file')
  })

  it('matchBodySymbolFile() should return file on Windows drive', function () {
    const r = matchBodySymbolFile('+ C:\\test\\file')
    expect(r).to.be.an('object')
    expect(r['symbol']).to.equal('+')
    expect(r['file']).to.equal('C:\\test\\file')
  })

  it('matchBodySymbolFile() should return file on Windows remote', function () {
    const r = matchBodySymbolFile('+ \\test\\file')
    expect(r).to.be.an('object')
    expect(r['symbol']).to.equal('+')
    expect(r['file']).to.equal('\\test\\file')
  })

  it('matchBodySymbolFile() should return file with emoji☕️', function () {
    const r = matchBodySymbolFile('T test/f☕️le')
    expect(r).to.be.an('object')
    expect(r['symbol']).to.equal('T')
    expect(r['file']).to.equal('test/f☕️le')
  })

  it('matchInfos() should return null on non match', function () {
    const r = matchInfos('+ test/file/null')
    expect(r).to.equal(null)
  })

  it('matchInfos() should return props and values', function () {
    const basic = matchInfos('Prop: Data')
    expect(basic).to.be.an('array')
    expect(basic).to.have.lengthOf(1)
    expect(basic[0]['Prop']).to.equal('Data')

    const space = matchInfos('Prop of archive: 322 MB')
    expect(space).to.be.an('array')
    expect(space).to.have.lengthOf(1)
    expect(space[0]['Prop of archive']).to.equal('322 MB')
  })

  it('matchInfos() should works with line containing 2 infos', function () {
    const basic = matchInfos('Prop1: Data1,  # Prop2: Data2')
    expect(basic).to.be.an('array')
    expect(basic).to.have.lengthOf(2)
    expect(basic[0]['Prop1']).to.equal('Data1')
    expect(basic[1]['Prop2']).to.equal('Data2')

    const space = matchInfos('Prop 1: Data 1,  # Prop 2: Data 2')
    expect(space).to.be.an('array')
    expect(space).to.have.lengthOf(2)
    expect(space[0]['Prop 1']).to.equal('Data 1')
    expect(space[1]['Prop 2']).to.equal('Data 2')
  })

  it('matchInfos() should return null on non match', function () {
    const r = matchInfos('+ test/file/null')
    expect(r).to.be.equal(null)
  })

  it('matchInfos() should return props and values', function () {
    const basic = matchInfos('Prop = Data')
    expect(basic).to.be.an('array')
    expect(basic).to.have.lengthOf(1)
    expect(basic[0]['Prop']).to.equal('Data')

    const space = matchInfos('Prop of archive = 322 MB')
    expect(space).to.be.an('array')
    expect(space).to.have.lengthOf(1)
    expect(space[0]['Prop of archive']).to.equal('322 MB')
  })

  it('matchInfos() should get props of values with colon', function () {
    const equalFirst = matchInfos('Equal first = True but:this = is valid val')
    expect(equalFirst).to.be.an('array')
    expect(equalFirst).to.have.lengthOf(1)
    expect(equalFirst[0]['Equal first']).to.equal('True but:this = is valid val')
  })

  it('matchInfos() should get props of values with equal', function () {
    const colonFirst = matchInfos('Colon first: True but:this = is valid val')
    expect(colonFirst).to.be.an('array')
    expect(colonFirst).to.have.lengthOf(1)
    expect(colonFirst[0]['Colon first']).to.equal('True but:this = is valid val')
  })

  // @TODO matchBodyHash
  it('matchBodyHash() should return null on non match', function () {
    const r = matchBodyHash('Todo: 1')
    expect(r).to.be.equal(null)
  })

  it('matchBodyHash() should hash on file', function () {
    const r = matchBodyHash('7E9C36FF6828353A             9  DirExt/sub1/sub1.txt')
    expect(r).to.be.an('object')
    expect(r['hash']).to.equal('7E9C36FF6828353A')
    expect(r['size']).to.equal(9)
    expect(r['file']).to.equal('DirExt/sub1/sub1.txt')
  })

  it('matchBodyHash() should return file on Windows drive', function () {
    const r = matchBodyHash('7E9C36FF6828353A             9   C:\\test\\file')
    expect(r).to.be.an('object')
    expect(r['hash']).to.equal('7E9C36FF6828353A')
    expect(r['size']).to.equal(9)
    expect(r['file']).to.equal('C:\\test\\file')
  })

  it('matchBodyHash() should return file on Windows remote', function () {
    const r = matchBodyHash('7E9C36FF6828353A             9   \\test\\file')
    expect(r).to.be.an('object')
    expect(r['file']).to.equal('\\test\\file')
    expect(r['hash']).to.equal('7E9C36FF6828353A')
    expect(r['size']).to.equal(9)
  })

  it('matchBodyHash() should return file with emoji☕️', function () {
    const r = matchBodyHash('7E9C36FF6828353A             9   test/f☕️le')
    expect(r).to.be.an('object')
    expect(r['file']).to.equal('test/f☕️le')
    expect(r['hash']).to.equal('7E9C36FF6828353A')
    expect(r['size']).to.equal(9)
  })

  it('matchBodyHash() should match on directory', function () {
    const r = matchBodyHash('               DirExt/sub1')
    expect(r).to.be.an('object')
    expect(r['file']).to.equal('DirExt/sub1')
  })

  it('matchBodyHash() should hash on non-sized file', function () {
    const r = matchBodyHash('               DirExt/sub1/sub1.txt')
    expect(r).to.be.an('object')
    expect(r['hash']).to.equal(undefined)
    expect(r['size']).to.be.NaN
    expect(r['file']).to.equal('DirExt/sub1/sub1.txt')
  })

})
