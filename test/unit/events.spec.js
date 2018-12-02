/* global describe, it */
import { expect } from 'chai'
import * as Events from '../../src/events'

describe('Unit: events.js', function () {
  describe('onErrorFactory()', function () {
    it('should operate on stream and error', function () {
      const sevenFake = { testprop: null }
      const errorFake = { testprop: '42' }
      const ErrFake = {
        assign: (stream, err) => {
          stream.testprop = err.testprop
        }
      }
      const onError = Events.onErrorFactory({
        Err: ErrFake })
      onError(sevenFake, errorFake)
      expect(sevenFake.testprop).to.eql('42')
    })
  })

  describe('onStderrFactory()', function () {
    it('should operate on stream and error', function () {
      const sevenFake = { testprop: null }
      const bufferFake = Buffer.from('42')
      const ErrFake = {
        assign: (stream, err) => {
          stream.testprop = err
        },
        fromBuffer: (buffer) => {
          return buffer.toString()
        }
      }
      const onError = Events.onStderrFactory({
        Err: ErrFake })
      onError(sevenFake, bufferFake)
      expect(sevenFake.testprop).to.eql('42')
    })
  })

  describe('onStdoutFactory()', function () {

  })
})
