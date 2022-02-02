/* global describe, it */
import { expect } from 'chai'
import main from '../../src/main.js'

describe('Unit: main.js', function () {
  describe('mainFactory()', function () {
    const Lifecycle = {
      createFactory: () => {
        return (stream) => {
          stream.create = true
          return stream
        }
      },
      run: (stream) => {
        stream.run = true
        return stream
      }
    }
    const listen = stream => { stream.isListened = true }
    it('should not run or listen given $defer', function () {
      const res = main.mainFactory({ Lifecycle })({ $defer: true })
      expect(res.$defer).to.eql(true)
      expect(res.create).to.eql(true)
      expect(res.run).to.eql(undefined)
      expect(res.isListened).to.eql(undefined)
    })

    it('should run or listen by default', function () {
      const res = main.mainFactory({ Lifecycle, listen })({})
      expect(res.create).to.eql(true)
      expect(res.run).to.eql(true)
      expect(res.isListened).to.eql(true)
    })

    it('should use $childProcess', function () {
      const res = main.mainFactory({ Lifecycle })({
        $childProcess: 'custom child process',
        $defer: true
      })
      expect(res._childProcess).to.eql('custom child process')
    })
  })

  describe('listenFactory()', function () {
    const Events = {
      onErrorFactory: () => {
        return (stream) => {
          stream.registerOnError = true
          return true
        }
      },
      onStderrFactory: () => {
        return (stream) => {
          stream.registerOnStderr = true
          return true
        }
      },
      onStdoutFactory: () => {
        return (stream) => {
          stream.registerOnStdout = true
          return true
        }
      },
      onEndFactory: () => {
        return (stream) => {
          stream.registerOnEnd = true
          return true
        }
      }
    }
    const Lifecycle = {
      listenFactory: () => {
        return (stream) => {
          Events.onErrorFactory()(stream)
          Events.onStderrFactory()(stream)
          Events.onStdoutFactory()(stream)
          Events.onEndFactory()(stream)
          return stream
        }
      }
    }

    it('should register event handlers', function () {
      const res = main.listenFactory({ Lifecycle, Events })({})
      expect(res.registerOnError).to.eql(true)
      expect(res.registerOnStderr).to.eql(true)
      expect(res.registerOnStdout).to.eql(true)
      expect(res.registerOnEnd).to.eql(true)
    })
  })
})
