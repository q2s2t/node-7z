/* global describe, it */
import { expect } from 'chai'
import { transformSwitchesToArgs } from '../../lib/switches.js'

describe('Utility: `switches`', function () {
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
})
