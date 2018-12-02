/* global describe, it */
import { expect } from 'chai'
import * as maybe from '../../src/maybe.js'
import { STAGE_HEADERS, STAGE_FOOTERS, STAGE_BODY } from '../../src/references.js'
import { Readable } from 'stream'

const voidFunction = () => {}
const falsyFunction = () => false
const truthlyFunction = () => true

describe('Unit: maybe.js', function () {
  describe('info()', function () {
    it('should return false given a non-matching stage', function () {
      const sevenFake = { _matchInfo: falsyFunction, _stage: 'nop' }
      const res = maybe.info(sevenFake, 'this is tested in parser.spec.js')
      expect(res).to.eql(false)
    })

    it('should return false given non-mathing data', function () {
      const sevenFake = {
        _stage: STAGE_FOOTERS,
        _matchInfos: voidFunction
      }
      const res = maybe.info(sevenFake, 'this is tested in parser.spec.js')
      expect(res).to.eql(false)
    })

    it('should add infos to stream given mathing data', function () {
      const sevenFake = {
        info: new Map(),
        _stage: STAGE_FOOTERS,
        _matchInfos () { return new Map().set('key', 'val') }
      }
      const res = maybe.info(sevenFake, 'this is tested in parser.spec.js')
      expect(sevenFake.info.get('key')).to.eql('val')
      expect(res).to.eql(true)
    })
  })

  describe('progress()', function () {
    it('should return false given falsy values', function () {
      const sevenFake = { _matchProgress: falsyFunction }
      const res = maybe.progress(sevenFake, 'this is tested in parser.spec.js')
      expect(res).to.equal(false)
    })

    it('should emit progress event given truthly values', function () {
      const sevenFake = new Readable()
      sevenFake._matchProgress = (stream, line) => {
        return line
      }
      const line = 'this is tested in parser.spec.js'
      sevenFake.once('progress', progress => {
        expect(progress).to.equal(line)
      })
      const res = maybe.progress(sevenFake, line)
      expect(res).to.eql(true)
    })
  })

  describe('endOfHeaders()', function () {
    it('should return false given a non-matching stage', function () {
      const sevenFake = { _stage: 'nop' }
      const res = maybe.endOfHeaders(sevenFake, 'this is tested in parser.spec.js')
      expect(res).to.eql(false)
    })

    it('should return false given non-mathing data', function () {
      const sevenFake = {
        _stage: STAGE_HEADERS,
        _matchEndOfHeaders: falsyFunction
      }
      const res = maybe.endOfHeaders(sevenFake, 'this is tested in parser.spec.js')
      expect(res).to.eql(false)
    })

    it('should set stream stage to BODY given mathing data', function () {
      const sevenFake = {
        _stage: STAGE_HEADERS,
        _matchEndOfHeaders: truthlyFunction
      }
      const res = maybe.endOfHeaders(sevenFake, 'this is tested in parser.spec.js')
      expect(sevenFake._stage).to.eql(STAGE_BODY)
      expect(res).to.eql(true)
    })
  })

  describe('endOfBody()', function () {
    it('should return false given a non-matching stage', function () {
      const sevenFake = { _stage: 'nop', _matchEndOfBody: falsyFunction }
      const res = maybe.endOfBody(sevenFake, 'this is tested in parser.spec.js')
      expect(res).to.eql(false)
    })

    it('should return false given non-mathing data', function () {
      const sevenFake = {
        _stage: STAGE_BODY,
        _matchEndOfBody: falsyFunction
      }
      const res = maybe.endOfBody(sevenFake, 'this is tested in parser.spec.js')
      expect(res).to.eql(false)
    })

    it('should set stream stage to BODY given mathing data', function () {
      const sevenFake = {
        _stage: STAGE_BODY,
        _matchEndOfBody: truthlyFunction
      }
      const res = maybe.endOfBody(sevenFake, 'this is tested in parser.spec.js')
      expect(sevenFake._stage).to.eql(STAGE_FOOTERS)
      expect(res).to.eql(true)
    })
  })

  describe('bodyData()', function () {
    it('should return false given a non-matching stage', function () {
      const sevenFake = { _stage: 'nop', _matchBodyData: falsyFunction }
      const res = maybe.bodyData(sevenFake, 'this is tested in parser.spec.js')
      expect(res).to.eql(false)
    })

    it('should return false given falsy values', function () {
      const sevenFake = { _matchBodyData: falsyFunction, _stage: STAGE_BODY }
      const res = maybe.bodyData(sevenFake, 'this is tested in parser.spec.js')
      expect(res).to.equal(false)
    })

    it('should emit progress event given truthly values', function () {
      const sevenFake = new Readable({ read () {} })
      sevenFake._stage = STAGE_BODY
      sevenFake._matchBodyData = (stream, line) => {
        return line
      }
      const line = 'this is tested in parser.spec.js'
      sevenFake.once('data', data => {
        expect(data.toString()).to.equal(line)
      })
      const res = maybe.bodyData(sevenFake, line)
      expect(res).to.eql(true)
    })
  })
})
