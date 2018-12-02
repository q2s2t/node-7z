/* global describe, it */
import { expect } from 'chai'
import * as main from '../../src/main.js'

describe('Unit: main.js', function () {
  describe('mainFactory()', function () {
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
      createFactory: () => {
        return (stream) => {
          stream.create = true
          return stream
        }
      },
      run: (stream) => {
        stream.run = true
        return stream
      },
      listenFactory: () => {
        return (stream) => {
          stream.listen = true
          Events.onErrorFactory()(stream)
          Events.onStderrFactory()(stream)
          Events.onStdoutFactory()(stream)
          Events.onEndFactory()(stream)
          return stream
        }
      }
    }
    it('should not run or listen given $defer', function () {
      const res = main.mainFactory({ Lifecycle, Events })({ $defer: true })
      expect(res.$defer).to.eql(true)
      expect(res.create).to.eql(true)
      expect(res.run).to.eql(undefined)
      expect(res.listen).to.eql(undefined)
    })

    it('should run or listen given', function () {
      const res = main.mainFactory({ Lifecycle, Events })({})
      expect(res.create).to.eql(true)
      expect(res.run).to.eql(true)
      expect(res.listen).to.eql(true)
    })

    it('should register event handlers', function () {
      const res = main.mainFactory({ Lifecycle, Events })({})
      expect(res.registerOnError).to.eql(true)
      expect(res.registerOnStderr).to.eql(true)
      expect(res.registerOnStdout).to.eql(true)
      expect(res.registerOnEnd).to.eql(true)
    })
  })
})
