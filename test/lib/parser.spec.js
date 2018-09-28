/* global describe, it */
import { expect } from 'chai'
import { matchProgress, matchPropsColon, matchPropsEquals, matchSymbolFile } from '../../lib/parser.js'

describe('Specification: parser.js', function () {
  it('matchProgress() should return null on non match', function () {
    const r = matchProgress('+ test/file/null')
    expect(r).to.be.null
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

  it('matchPropsColon() should return null on non match', function () {
    const r = matchPropsColon('+ test/file/null')
    expect(r).to.be.null
  })

  it('matchPropsColon() should return props and values', function () {
    const basic = matchPropsColon('Prop: Data')
    expect(basic).to.be.an('array')
    expect(basic).to.have.lengthOf(1)
    expect(basic[0]['Prop']).to.equal('Data')

    const space = matchPropsColon('Prop of archive: 322 MB')
    expect(space).to.be.an('array')
    expect(space).to.have.lengthOf(1)
    expect(space[0]['Prop of archive']).to.equal('322 MB')
  })

  it('matchPropsColon() should works with line containing 2 infos', function () {
    const basic = matchPropsColon('Prop1: Data1,  # Prop2: Data2')
    expect(basic).to.be.an('array')
    expect(basic).to.have.lengthOf(2)
    expect(basic[0]['Prop1']).to.equal('Data1')
    expect(basic[1]['Prop2']).to.equal('Data2')

    const space = matchPropsColon('Prop 1: Data 1,  # Prop 2: Data 2')
    expect(space).to.be.an('array')
    expect(space).to.have.lengthOf(2)
    expect(space[0]['Prop 1']).to.equal('Data 1')
    expect(space[1]['Prop 2']).to.equal('Data 2')
  })
})
