/* global describe, it */
import { expect } from 'chai'
import * as Commands from '../../src/commands'

const identityFunction = opt => opt

describe('Unit: commands.js', function () {
  describe('standardFactory()', function () {
    it('set command name and targets', function () {
      const standard = Commands.standardFactory({
        main: identityFunction,
        command: 'azerty'
      })
      const res = standard('archive', 'source')
      expect(res._command).to.eql('azerty')
      expect(res._target).to.deep.eql(['archive', 'source'])
    })
  })

  describe('extractFactory()', function () {
    it('set command name and targets', function () {
      const extract = Commands.extractFactory({
        main: identityFunction,
        command: 'azerty'
      })
      const res = extract('archive', 'output')
      expect(res._command).to.eql('azerty')
      expect(res._target).to.includes('archive')
      expect(res.outputDir).to.eql('output')
    })

    it('set command name and targets with $cherryPick', function () {
      const extract = Commands.extractFactory({
        main: identityFunction,
        command: 'azerty'
      })
      const res = extract('archive', 'output', { $cherryPick: 'cherry' })
      expect(res._command).to.eql('azerty')
      expect(res._target).to.deep.eql(['archive', 'cherry'])
      expect(res.outputDir).to.eql('output')
    })
  })

  describe('simplexFactory()', function () {
    it('set command name and targets', function () {
      const simplex = Commands.simplexFactory({
        main: identityFunction,
        command: 'azerty'
      })
      const res = simplex('archive')
      expect(res._command).to.eql('azerty')
      expect(res._target).to.includes('archive')
    })

    it('set command name and targets with $cherryPick', function () {
      const simplex = Commands.simplexFactory({
        main: identityFunction,
        command: 'azerty'
      })
      const res = simplex('archive', { $cherryPick: 'cherry' })
      expect(res._command).to.eql('azerty')
      expect(res._target).to.deep.eql(['archive', 'cherry'])
    })
  })
})
