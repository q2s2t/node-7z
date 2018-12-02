/* global describe, it */
import { expect } from 'chai'
import { fromOptions } from '../../src/args.js'

describe('Unit: args.js', function () {
  describe('fromOptions()', function () {
    it('should add command letter as first in array', function () {
      expect(fromOptions({
        _command: 'add'
      })).to.deep.eql(['a'])
    })

    it('should flatten complex arrays', function () {
      const options = {
        _command: 'rename',
        _target: [
          'this is my source.7z',
          ['array', 'of', 'things'],
          ['like a rename', 'list'],
          undefined
        ]
      }
      const r = fromOptions(options)
      expect(r).to.deep.eql(['rn', 'this is my source.7z', 'array', 'of', 'things', 'like a rename', 'list'])
    })
  })
})
