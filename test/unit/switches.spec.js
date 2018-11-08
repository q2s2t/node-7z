/* global describe, it */
import { expect } from 'chai'
import { transformSwitchesToArgs, transformApiToSwitch } from '../../src/switches.js'

describe('Unit: switches.js', function () {
  it('Should return deflaut flags with no args', function () {
    const r = transformSwitchesToArgs()
    expect(r).not.to.contain('-sdel')
    expect(r).not.to.contain('-spl')
    expect(r).not.to.contain('-sni')
    expect(r).not.to.contain('-so')
    expect(r).not.to.contain('-spd')
    expect(r).not.to.contain('-spe')
    expect(r).not.to.contain('-spf')
    expect(r).not.to.contain('-ssw')
    expect(r).not.to.contain('-stl')
    expect(r).to.contain('-y')
    expect(r).to.contain('-bb3')
  })

  it('Should not assume Yes if specified', function () {
    const r = transformSwitchesToArgs({
      y: false
    })
    expect(r).not.to.contain('-y')
  })

  it('Should set contextual switches if specified', function () {
    const r = transformSwitchesToArgs({
      sns: true,
      ssc: true
    })
    expect(r).to.contain('-sns')
    expect(r).to.contain('-ssc')
  })

  it('Should unset contextual switches specified', function () {
    const r = transformSwitchesToArgs({
      sns: false,
      ssc: false
    })
    expect(r).to.contain('-sns-')
    expect(r).to.contain('-ssc-')
  })

  it('should return non default booleans when specified', function () {
    const r = transformSwitchesToArgs({
      so: true,
      spl: true,
      ssw: true,
      y: false
    })
    expect(r).to.contain('-so')
    expect(r).to.contain('-spl')
    expect(r).to.contain('-ssw')
    expect(r).not.to.contain('-y')
  })

  it('should return complex values when needed', function () {
    const r = transformSwitchesToArgs({
      ssc: true,
      ssw: true,
      m: ['x0']
    })
    expect(r).to.contain('-ssc')
    expect(r).to.contain('-ssw')
    expect(r).to.contain('-mx0')
    expect(r).to.contain('-y')
  })

  it('should return complex values with spaces and quotes', function () {
    const r = transformSwitchesToArgs({
      ssc: true,
      ssw: true,
      m: ['0=BCJ', '1=LZMA:d=21'],
      p: 'My Super Pasw,àù£*"'
    })
    expect(r).to.contain('-ssc')
    expect(r).to.contain('-ssw')
    expect(r).to.contain('-m0=BCJ')
    expect(r).to.contain('-m1=LZMA:d=21')
    expect(r).to.contain('-pMy Super Pasw,àù£*"')
    expect(r).to.contain('-y')
  })

  it('should transform module API to cryptic 7z API', function () {
    const r = transformApiToSwitch({
      recursive: true,
      storeSymLinks: true,
      hashMethod: 'CRC32',
      method: ['0=BCJ', '=LZMA:d=21'],
      nonExistingSwitch: 'hello'
    })
    expect(r).to.deep.equal({
      recursive: true,
      storeSymLinks: true,
      hashMethod: 'CRC32',
      method: [ '0=BCJ', '=LZMA:d=21' ],
      nonExistingSwitch: 'hello',
      r: true,
      snl: true,
      scrc: 'CRC32',
      m: [ '0=BCJ', '=LZMA:d=21' ]
    })
  })

  it('should not add progress when not wanted', function () {
    const r = transformApiToSwitch({})
    expect(r.bs).to.equal(undefined)
  })

  it('should add progress when wanted by `bs`', function () {
    const r = transformApiToSwitch({
      bs: ['p1']
    })
    expect(r.bs).to.deep.equal(['p1'])
  })

  it('should add progress when wanted by `outputStreams`', function () {
    const r = transformApiToSwitch({
      bs: ['e2'],
      $progress: true
    })
    expect(r.bs).to.deep.equal(['e2', 'p1'])
  })

  it('should add progress when wanted by `$progress`', function () {
    const r = transformApiToSwitch({
      $progress: true
    })
    expect(r.bs).to.deep.equal(['p1'])
  })
})
