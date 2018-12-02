/* global describe, it */
import { expect } from 'chai'
import { fromOptions } from '../../src/bin.js'

describe('Unit: bin.js', function () {
  describe('fromOptions()', function () {
    it('should return deflaut value with no option', function () {
      expect(fromOptions({})).to.eql('7z')
    })

    it('should return custom value when specified', function () {
      expect(fromOptions({ $bin: 'my/bin' })).to.eql('my/bin')
    })
  })
})
