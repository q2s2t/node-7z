/* global describe, it */
import { expect } from 'chai'
import { fromOptions } from '../../src/flags.js'

describe('Unit: flags.js', function () {
  describe('fromOptions()', function () {
    it('should return deflaut flags with no args', function () {
      const r = fromOptions()
      expect(r).not.to.includes('-sdel')
      expect(r).not.to.includes('-spl')
      expect(r).not.to.includes('-sni')
      expect(r).not.to.includes('-so')
      expect(r).not.to.includes('-spd')
      expect(r).not.to.includes('-spe')
      expect(r).not.to.includes('-spf')
      expect(r).not.to.includes('-ssw')
      expect(r).not.to.includes('-stl')
      expect(r).to.includes('-y')
      expect(r).to.includes('-bb3')
    })

    it('should not assume yes if specified', function () {
      const r = fromOptions({
        yes: false
      })
      expect(r).not.to.includes('-y')
    })

    it('should set boolean contextual flags if specified', function () {
      const r = fromOptions({
        caseSensitive: true,
        alternateStreamStore: true
      })
      expect(r).to.includes('-sns')
      expect(r).to.includes('-ssc')
    })

    it('should unset boolean contextual flags specified', function () {
      const r = fromOptions({
        caseSensitive: false,
        alternateStreamStore: false
      })
      expect(r).to.includes('-sns-')
      expect(r).to.includes('-ssc-')
    })

    it('should return non default booleans when specified', function () {
      const r = fromOptions({
        yes: false,
        openFiles: true,
        largePages: true,
        toStdout: true

      })
      expect(r).to.includes('-so')
      expect(r).to.includes('-spl')
      expect(r).to.includes('-ssw')
      expect(r).not.to.includes('-y')
    })

    it('should return complex values when needed', function () {
      const r = fromOptions({
        caseSensitive: true,
        openFiles: true,
        method: ['x0']
      })
      expect(r).to.includes('-ssc')
      expect(r).to.includes('-ssw')
      expect(r).to.includes('-mx0')
      expect(r).to.includes('-y')
    })

    it('should return complex values with spaces and quotes', function () {
      const r = fromOptions({
        caseSensitive: true,
        openFiles: true,
        method: ['0=BCJ', '1=LZMA:d=21'],
        password: 'My Super Pasw,àù£*"'
      })
      expect(r).to.includes('-ssc')
      expect(r).to.includes('-ssw')
      expect(r).to.includes('-m0=BCJ')
      expect(r).to.includes('-m1=LZMA:d=21')
      expect(r).to.includes('-pMy Super Pasw,àù£*"')
      expect(r).to.includes('-y')
    })

    it('should not add progress when not given', function () {
      const r = fromOptions({})
      expect(r.bs).to.equal(undefined)
    })

    it('should add progress when given by `outputStreams`', function () {
      const r = fromOptions({
        outputStreams: ['e2'],
        $progress: true
      })
      expect(r).to.include('-bsp1')
      expect(r).to.include('-bse2')
    })

    it('should not add `outputDir` when given falsy values', function () {
      const resUndef = fromOptions({ outputDir: undefined })
      const resFalse = fromOptions({ outputDir: false })
      const resNull = fromOptions({ outputDir: null })
      const resEmpty = fromOptions({ outputDir: '' })
      expect(resUndef).not.to.haveOwnProperty('outputDir')
      expect(resFalse).not.to.haveOwnProperty('outputDir')
      expect(resNull).not.to.haveOwnProperty('outputDir')
      expect(resEmpty).not.to.haveOwnProperty('outputDir')
    })

    it('should add `outputDir` when given good values', function () {
      const res = fromOptions({ outputDir: 'th is/dir/o ut' })
      expect(res).to.includes('-oth is/dir/o ut')
    })

    it('should add progress when given by `$progress`', function () {
      const r = fromOptions({
        $progress: true
      })
      expect(r).to.include('-bsp1')
    })

    it('should add arguments when given by `$raw`', function () {
      const rawFake = ['-bsp1', '-bb3', '-m0=BCJ', 'm1=LZMA:d=21']
      const r = fromOptions({
        $raw: rawFake
      })
      rawFake.map(arg => expect(r).to.include(arg))
      expect(r).to.include('-bsp1')
    })

    it('should not add string values if only key is pecidied', function () {
      const r = fromOptions({
        password: false,
      })
      expect(r).not.to.includes('-p')
    })

  })
})
