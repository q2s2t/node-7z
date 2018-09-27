/* global describe, it */
import { expect } from 'chai'
import { matchProgress, matchPropsColon, matchPropsColonDuo, matchPropsEquals, matchSymbolFile } from '../../lib/parser.js'

describe('Specification: parser.js', function () {
  it('progress should return null on non match', function () {
    const r = matchProgress('+ test/file/null')
    expect(r).to.be.null
  })

  it('progress should return progress', function () {
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
})
