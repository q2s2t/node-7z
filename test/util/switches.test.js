/* global describe, it */
import { expect } from 'chai'
import { toChildProcessArgs } from '../../util/switches'

describe('Utility: `switches`', function () {
  it('Should return deflaut flags with no args', function () {
    const r = toChildProcessArgs()
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
  })

  it('Should not assume Yes if specified', function () {
    const r = toChildProcessArgs({
      y: false
    })
    expect(r).not.to.contain('-y')
  })

  it('Should set contextual switches if specified', function () {
    const r = toChildProcessArgs({
      sns: true,
      ssc: true
    })
    expect(r).to.contain('-sns')
    expect(r).to.contain('-ssc')
  })

  it('Should unset contextual switches specified', function () {
    const r = toChildProcessArgs({
      sns: false,
      ssc: false
    })
    expect(r).to.contain('-sns-')
    expect(r).to.contain('-ssc-')
  })

  it('should return non default booleans when specified', function () {
    var r = toChildProcessArgs({
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
    var r = toChildProcessArgs({
      ssc: true,
      ssw: true,
      m: 'x0'
    })
    expect(r).to.contain('-ssc')
    expect(r).to.contain('-ssw')
    expect(r).to.contain('-mx0')
    expect(r).to.contain('-y')
  })

  it('should return complex values with spaces and quotes', function () {
    var r = toChildProcessArgs({
      ssc: true,
      ssw: true,
      m0: '=BCJ',
      m1: '=LZMA:d=21',
      p: 'My Super Pasw,àù£*"'
    })
    expect(r).to.contain('-ssc')
    expect(r).to.contain('-ssw')
    expect(r).to.contain('-m0=BCJ')
    expect(r).to.contain('-m1=LZMA:d=21')
    expect(r).to.contain('-pMy Super Pasw,àù£*"')
    expect(r).to.contain('-y')
  })

  it('should works with the `raw` switch', function () {
    var r = toChildProcessArgs({
      raw: ['-i!*.jpg', '-i!*.png', '-r0']
    })
    expect(r).to.contain('-i!*.jpg')
    expect(r).to.contain('-i!*.png')
    expect(r).to.contain('-r0')
  })

  it('should add wildcards', function () {
    var r = toChildProcessArgs({
      wildcards: ['*.jpg', '*.png']
    })
    expect(r).to.contain('*.jpg')
    expect(r).to.contain('*.png')
  })
})
