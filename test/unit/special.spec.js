/* global describe, it */
import { expect } from 'chai'
import { transformBinToString, transformSpecialArrayToArgs } from '../../src/special.js'

describe('Unit: special.js', function () {
  it('should works with the `$raw` special switch', function () {
    const r = transformSpecialArrayToArgs({
      $raw: ['-i!*.jpg', '-i!*.png', '-r0']
    }, '$raw')
    expect(r).to.contain('-i!*.jpg')
    expect(r).to.contain('-i!*.png')
    expect(r).to.contain('-r0')
  })

  it('should not err with `$raw` special switch', function () {
    const r = transformSpecialArrayToArgs({}, '$raw')
    expect(r).to.be.an('array').that.have.lengthOf(0)
  })

  it('should works with the `$wildcards` special switch', function () {
    const r = transformSpecialArrayToArgs({
      $wildcards: ['*.jpg', '*.png']
    }, '$wildcards')
    expect(r).to.contain('*.jpg')
    expect(r).to.contain('*.png')
  })

  it('should not err with the `$wildcards` special switch', function () {
    const r = transformSpecialArrayToArgs({}, '$wildcards')
    expect(r).to.be.an('array').that.have.lengthOf(0)
  })

  it('should use custom $bin when specified', function () {
    const r = transformBinToString({
      $bin: './node_modules/.bin/7z'
    })
    expect(r).to.equals('./node_modules/.bin/7z')
  })

  it('should fallback to deflaut if $bin not specified', function () {
    const r = transformBinToString({})
    expect(r).to.equals('7z')
  })
})
