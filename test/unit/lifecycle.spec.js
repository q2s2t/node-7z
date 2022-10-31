/* globals describe, it */
import { expect } from 'chai'
import { Readable } from 'stream'
import Seven from '../../src/lifecycle.js'
import { STAGE_HEADERS } from '../../src/references.js'

const sevenFakeFactory = () => {
  const sevenFake = new Readable({ read () {} })
  sevenFake._childProcess = new Readable({ read () {} })
  sevenFake._childProcess.stderr = new Readable({ read () {} })
  sevenFake._childProcess.stdout = new Readable({ read () {} })
  return sevenFake
}

const voidFunction = function () {}
const binFromOptionsFake = { fromOptions: () => '7z' }
const flagsFromOptionsFake = { fromOptions: () => [] }
const argsFromOptionsFake = { fromOptions: () => [] }
const parserFake = { fetch: () => {} }

describe('Unit: lifecycle.js', function () {
  describe('createFactory()', function () {
    it('should be a readable stream', function () {
      const create = Seven.createFactory({
        Bin: binFromOptionsFake,
        Args: argsFromOptionsFake,
        Flags: flagsFromOptionsFake,
        Parser: parserFake
      })
      const sevenFake = create({})
      expect(sevenFake).to.be.an.instanceOf(Readable)
    })

    it('should has base values', function () {
      const create = Seven.createFactory({
        Bin: binFromOptionsFake,
        Flags: flagsFromOptionsFake,
        Parser: parserFake,
        Args: argsFromOptionsFake
      })
      const sevenFake = create({})
      expect(sevenFake._readableState.objectMode).to.eql(true)
      expect(sevenFake._readableState.highWaterMark).to.eql(16)
      expect(sevenFake.info).to.be.an.instanceOf(Map)
      expect(sevenFake._stage).to.eql(STAGE_HEADERS)
    })

    it('should set _isProgressFlag when specified', function () {
      const create = Seven.createFactory({
        Bin: binFromOptionsFake,
        Flags: { fromOptions: () => ['-bsp1'] },
        Args: argsFromOptionsFake,
        Parser: parserFake
      })
      const sevenFake = create({})
      expect(sevenFake._isProgressFlag).to.eql(true)
    })
  })

  describe('listenFactory()', function () {
    it('should handle child process error', function () {
      let once = false
      const sevenFake = sevenFakeFactory()
      const errFake = new Error('unknown error')
      Seven.listenFactory({
        errorHandler: (stream, err) => {
          expect(err).to.eql(errFake)
          once = true
        },
        stderrHandler: voidFunction,
        stdoutHandler: voidFunction,
        endHandler: voidFunction
      })(sevenFake)
      sevenFake._childProcess.emit('error', errFake)
      expect(once).to.eql(true)
    })

    it('should handle stderr data', function () {
      let once = false
      const sevenFake = sevenFakeFactory()
      const errFake = 'unknown error\r\n'
      Seven.listenFactory({
        errorHandler: voidFunction,
        stderrHandler: (stream, err) => {
          expect(err).to.eql(errFake)
          once = true
        },
        stdoutHandler: voidFunction,
        endHandler: voidFunction
      })(sevenFake)
      sevenFake._childProcess.stderr.emit('data', errFake)
      sevenFake._childProcess.stderr.emit('end')
      expect(once).to.eql(true)
    })

    it('should handle stdout data', function () {
      let once = false
      const sevenFake = sevenFakeFactory()
      const dataFake = 'some data'
      Seven.listenFactory({
        errorHandler: voidFunction,
        stderrHandler: voidFunction,
        stdoutHandler: (stream, data) => {
          expect(data).to.eql(dataFake)
          once = true
        },
        endHandler: voidFunction
      })(sevenFake)
      sevenFake._childProcess.stdout.emit('data', dataFake)
      sevenFake._childProcess.stdout.emit('end')
      expect(once).to.eql(true)
    })

    it('should handle child process close', function () {
      let once = false
      const sevenFake = sevenFakeFactory()
      Seven.listenFactory({
        errorHandler: voidFunction,
        stderrHandler: voidFunction,
        endHandler: () => {
          once = true
        },
        stdoutHandler: voidFunction
      })(sevenFake)
      sevenFake._childProcess.emit('close')
      expect(once).to.eql(true)
    })

    it('should be chainable', function () {
      const sevenFake = sevenFakeFactory()
      const res = Seven.listenFactory({
        errorHandler: voidFunction,
        stderrHandler: voidFunction,
        stdoutHandler: voidFunction,
        endHandler: voidFunction
      })(sevenFake)
      expect(res).to.eql(sevenFake)
    })
  })

  describe('run()', function () {
    it('should emit an child process error', function (done) {
      const sevenFake = sevenFakeFactory()
      sevenFake._bin = 'not_a_program'
      sevenFake._args = []
      Seven.run(sevenFake)
      sevenFake._childProcess.on('error', err => {
        expect(err).to.be.an.instanceOf(Error)
        done()
      })
    })

    it('should be chainable', function () {
      const sevenFake = sevenFakeFactory()
      sevenFake._bin = 'not_a_program'
      sevenFake._args = []
      const fromRun = Seven.run(sevenFake)
      sevenFake._childProcess.on('error', voidFunction)
      expect(fromRun).to.eql(sevenFake)
    })
  })
})
