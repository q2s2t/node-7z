/* globals describe, it */
import { expect } from 'chai'
import * as error from '../../src/error.js'

describe('Unit: error.js', function () {
  describe('assign()', function () {
    it('should add new error', function () {
      const sevenFake = {}
      const err = new Error('unknown error')
      const res = error.assign(sevenFake, err)
      expect(res.err).to.be.an.instanceOf(Error)
      expect(res.err.name).to.eql('Error')
      expect(res.err.message).to.eql('unknown error')
    })

    it('should merge errors', function () {
      const sevenFake = {}
      const err1 = new Error('err1')
      const err2 = new Error('err2')
      err1.level = 'WARNING'
      const res1 = error.assign(sevenFake, err1)
      const res2 = error.assign(sevenFake, err2)
      expect(sevenFake.err).to.be.an.instanceOf(Error)
      expect(sevenFake.err.name).to.eql('Error')
      expect(sevenFake.err.message).to.eql('err2')
      expect(sevenFake.err.level).to.eql('WARNING')
      expect(res1).to.eql(sevenFake)
      expect(res2).to.eql(sevenFake)
    })

    it('should return stream', function () {
      const sevenFake = {}
      const res = error.assign(sevenFake, new Error('new'))
      expect(res).to.eql(sevenFake)
    })
  })

  describe('error.fromBuffer()', function () {
    it('should make error on non match', function () {
      const bufferBase = 'from stdout'
      const buffer = Buffer.from(bufferBase)
      const err = error.fromBuffer(buffer)
      expect(err).to.be.an.instanceOf(Error)
      expect(err.name).to.eql('Error')
      expect(err.message).to.eql('unknown error')
      expect(err.stderr).to.eql(bufferBase)
    })

    it('should make error on warning', function () {
      const bufferBase = 'WARNING: File error\n'
      const buffer = Buffer.from(bufferBase)
      const err = error.fromBuffer(buffer)
      expect(err).to.be.an.instanceOf(Error)
      expect(err.name).to.eql('Error')
      expect(err.message).to.eql('File error')
      expect(err.level).to.eql('WARNING')
      expect(err.stderr).to.eql(bufferBase)
    })

    it('should make error on error', function () {
      const bufferBase = 'Error: File error\n'
      const buffer = Buffer.from(bufferBase)
      const err = error.fromBuffer(buffer)
      expect(err).to.be.an.instanceOf(Error)
      expect(err.name).to.eql('Error')
      expect(err.message).to.eql('File error')
      expect(err.level).to.eql('ERROR')
      expect(err.stderr).to.eql(bufferBase)
    })

    it('should make error on Windows', function () {
      const bufferBase = `\r\nERROR: The system cannot find the file specified.\r\n\\i\\hope\\this\\is\\not\\where\\your\\archive\\is\r\n\r\n`
      const buffer = Buffer.from(bufferBase)
      const err = error.fromBuffer(buffer)
      expect(err).to.be.an.instanceOf(Error)
      expect(err.name).to.eql('Error')
      expect(err.message).to.eql('The system cannot find the file specified.')
      expect(err.level).to.eql('ERROR')
      expect(err.stderr).to.eql(bufferBase)
    })
  })
})
