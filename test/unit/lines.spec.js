/* global describe, it */
import { expect } from 'chai'
import { fromBuffer } from '../../src/lines.js'

describe('Unit: lines.js', function () {
  describe('toLinesFactory()', function () {
    it('should return simple values from 1-line', function () {
      const seven = {}
      const buffer = Buffer.from('my line\n')
      const r = fromBuffer(seven, buffer)
      expect(r).to.includes('my line')
    })

    it('should memorize partial values', function () {
      const seven = {}
      const buffer1 = Buffer.from('my line\nsecond')
      const r1 = fromBuffer(seven, buffer1)
      expect(r1).to.includes('my line')
      expect(r1).not.to.includes('second line')
      const buffer2 = Buffer.from(' line\n')
      const r2 = fromBuffer(seven, buffer2)
      expect(r2).to.includes('second line')
    })

    it('should work on Windows stdout', function () {
      const seven = {}
      const buffer1 = Buffer.from('my line\r\nsecond')
      const r1 = fromBuffer(seven, buffer1)
      expect(r1).to.includes('my line')
      expect(r1).not.to.includes('second line')
      const buffer2 = Buffer.from(' line\r\n')
      const r2 = fromBuffer(seven, buffer2)
      expect(r2).to.includes('second line')
    })

    it('should work on progress stdout', function () {
      const seven = {}
      const buffer1 = Buffer.from('my line\x08\x08second')
      const r1 = fromBuffer(seven, buffer1)
      expect(r1).to.includes('my line')
      expect(r1).not.to.includes('second line')
      const buffer2 = Buffer.from(' line\x08\x08')
      const r2 = fromBuffer(seven, buffer2)
      expect(r2).to.includes('second line')
    })

    it('should work on return carriage stdout', function () {
      const seven = {}
      const buffer1 = Buffer.from('my line\r    \rsecond')
      const r1 = fromBuffer(seven, buffer1)
      expect(r1).to.includes('my line')
      expect(r1).not.to.includes('second line')
      const buffer2 = Buffer.from(' line\r    \r')
      const r2 = fromBuffer(seven, buffer2)
      expect(r2).to.includes('second line')
    })
  })
})
