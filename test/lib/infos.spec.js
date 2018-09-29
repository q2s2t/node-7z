/* global describe, it */
import { expect } from 'chai'
import { add } from '../../lib/infos.js'

describe('Specification: infos.js', function () {
  it('should add info to stream from array', function () {
    const stream = {}
    add(stream, [ { Prop1: 'Data1', Prop2: 'Data2' } ])
    expect(stream.Prop1).to.equal('Data1')
    expect(stream.Prop2).to.equal('Data2')
  })
})
