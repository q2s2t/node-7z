/* global describe, it, beforeEach */
import { expect } from 'chai'
import Events from '../../src/events.js'
import { STAGE_HEADERS, STAGE_BODY, STAGE_FOOTERS } from '../../src/references.js'
import { Readable } from 'stream'

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
      const onError = Events.onErrorFactory({ Err: ErrFake })
      onError(sevenFake, errorFake)
      expect(sevenFake.testprop).to.eql('42')
    })
  })

  describe('onStderrFactory()', function () {
    it('should operate on stream and error', function () {
      const sevenFake = {}
      const bufferFake = Buffer.from('42')
      const ErrFake = {
        append: (stream, err) => {
          stream.stderr = err
        }
      }
      const onError = Events.onStderrFactory({ Err: ErrFake })
      onError(sevenFake, bufferFake)
      expect(sevenFake.stderr).to.eql(bufferFake)
    })
  })

  describe('onStdoutFactory()', function () {
    let counter
    const Maybe = {
      info: (stream, line) => {
        if (line === 'info') { ++counter.info; return true } return false
      },
      endOfHeaders: (stream, line) => {
        if (line === 'endOfHeaders') { ++counter.endOfHeaders; stream._stage = STAGE_BODY; return true } return false
      },
      endOfBody: (stream, line) => {
        if (line === 'endOfBody') { ++counter.endOfBody; stream._stage = STAGE_FOOTERS; return true } return false
      },
      progress: (stream, line) => {
        if (line === 'progress') { ++counter.progress; return true } return false
      },
      bodyData: (stream, line) => {
        if (line === 'bodyData') { ++counter.bodyData; return true } return false
      }
    }

    beforeEach(function () {
      counter = {
        info: 0,
        endOfHeaders: 0,
        bodyData: 0,
        progress: 0,
        endOfBody: 0
      }
    })

    it('should flow the normal way', function () {
      // 1. setup
      const sevenFake = {
        _stage: STAGE_HEADERS,
        _isProgressFlag: true
      }
      // 2. run
      const onStdout = Events.onStdoutFactory({ Maybe })
      onStdout(sevenFake, 'info')
      onStdout(sevenFake, 'endOfHeaders')
      onStdout(sevenFake, 'progress')
      onStdout(sevenFake, 'bodyData')
      onStdout(sevenFake, 'progress')
      onStdout(sevenFake, 'bodyData')
      onStdout(sevenFake, 'bodyData')
      onStdout(sevenFake, 'bodyData')
      onStdout(sevenFake, 'progress')
      onStdout(sevenFake, 'endOfBody')
      onStdout(sevenFake, 'info')
      // 3. assert
      expect(counter.info).to.eql(2)
      expect(counter.endOfHeaders).to.eql(1)
      expect(counter.bodyData).to.eql(4)
      expect(counter.progress).to.eql(3)
      expect(counter.endOfBody).to.eql(1)
    })

    it('should flow the normal way with symbol command', function () {
      // 1. setup
      const sevenFake = {
        _stage: STAGE_HEADERS,
        _dataType: 'symbol',
        _isProgressFlag: true
      }
      // 2. run
      const onStdout = Events.onStdoutFactory({ Maybe })
      onStdout(sevenFake, 'info')
      onStdout(sevenFake, 'random stuff')
      onStdout(sevenFake, 'endOfHeaders')
      onStdout(sevenFake, 'progress')
      onStdout(sevenFake, 'bodyData')
      onStdout(sevenFake, 'progress')
      onStdout(sevenFake, 'bodyData')
      onStdout(sevenFake, 'bodyData')
      onStdout(sevenFake, 'bodyData')
      onStdout(sevenFake, 'progress')
      onStdout(sevenFake, 'endOfBody')
      onStdout(sevenFake, 'info')
      // 3. assert
      expect(counter.info).to.eql(2)
      expect(counter.endOfHeaders).to.eql(1)
      expect(counter.bodyData).to.eql(4)
      expect(counter.progress).to.eql(3)
      expect(counter.endOfBody).to.eql(1)
    })
  })

  describe('onEndFactory()', function () {
    const ErrFake = {
      append: (stream, err) => {
        stream.stderr = err
      },
      assign: (stream, err) => {
        stream.testprop = err
      },
      fromBuffer: (buffer) => {
        return buffer.toString()
      }
    }

    it('should emit error and close given error in process', function (done) {
      const onEnd = Events.onEndFactory({ ErrFake })
      const sevenFake = new Readable({ read () {} })
      const errFake = new Error('FakeError')
      let counterError = 0
      let counterClose = 0
      sevenFake.on('error', () => { ++counterError })
      sevenFake.on('end', () => { ++counterClose })
      sevenFake.err = errFake
      const res = onEnd(sevenFake)
      expect(res).to.eql(sevenFake)
      expect(res.err).to.eql(errFake)
      expect(counterError).to.eql(1)
      expect(counterClose).to.eql(1)
      done()
    })

    it('should emit end event', function (done) {
      const onEnd = Events.onEndFactory({ ErrFake })
      const sevenFake = new Readable({ read () {} })
      let counterClose = 0
      sevenFake.on('end', () => { ++counterClose })
      const res = onEnd(sevenFake)
      expect(res).to.eql(sevenFake)
      expect(counterClose).to.eql(1)
      done()
    })
  })
})
