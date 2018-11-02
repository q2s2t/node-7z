/* global describe, it */
import { expect } from 'chai'
import { matchBodyProgress, matchBodySymbol, matchBodyHash, matchEndOfHeadersHyphen, matchInfos, matchEndOfHeadersSymbol, matchEndOfBodySymbol, matchEndOfBodyHyphen, matchBodyList } from '../../src/parser.js'
import { STAGE_HEADERS } from '../../src/references.js'
import { SevenZipStream } from '../../src/stream.js'

describe('Unit: parser.js', function () {
  describe('matchInfos()', function () {
    it('should return null on non match', function () {
      const r = matchInfos({ info: new Map() }, '+ test/file/null')
      expect(r).to.equal(null)
    })

    it('should return props and values', function () {
      const basic = matchInfos({ info: new Map() }, 'Prop: Data')
      expect(basic).to.be.an('map')
      expect(basic.size).to.equal(1)
      expect(basic.get('Prop')).to.equal('Data')

      const space = matchInfos({ info: new Map() }, 'Prop of archive: 322 MB')
      expect(space).to.be.an('map')
      expect(space.size).to.equal(1)
      expect(space.get('Prop of archive')).to.equal('322 MB')
    })

    it('should works with line containing 2 infos', function () {
      const basic = matchInfos({ info: new Map() }, 'Prop1: Data1,  # Prop2: Data2')
      expect(basic).to.be.an('map')
      expect(basic.size).to.equal(2)
      expect(basic.get('Prop1')).to.equal('Data1')
      expect(basic.get('Prop2')).to.equal('Data2')

      const space = matchInfos({ info: new Map() }, 'Prop 1: Data 1,  # Prop 2: Data 2')
      expect(space).to.be.an('map')
      expect(space.size).to.equal(2)
      expect(space.get('Prop 1')).to.equal('Data 1')
      expect(space.get('Prop 2')).to.equal('Data 2')
    })

    it('should return props and values', function () {
      const basic = matchInfos({ info: new Map() }, 'Prop = Data')
      expect(basic).to.be.an('map')
      expect(basic.size).to.equal(1)
      expect(basic.get('Prop')).to.equal('Data')

      const space = matchInfos({ info: new Map() }, 'Prop of archive = 322 MB')
      expect(space).to.be.an('map')
      expect(space.size).to.equal(1)
      expect(space.get('Prop of archive')).to.equal('322 MB')
    })

    it('should get props of values with colon', function () {
      const equalFirst = matchInfos({ info: new Map() }, 'Equal first = True but:this = is valid val')
      expect(equalFirst).to.be.an('map')
      expect(equalFirst.size).to.equal(1)
      expect(equalFirst.get('Equal first')).to.equal('True but:this = is valid val')
    })

    it('should get props of values with equal', function () {
      const colonFirst = matchInfos({ info: new Map() }, 'Colon first: True but:this = is valid val')
      expect(colonFirst).to.be.an('map')
      expect(colonFirst.size).to.equal(1)
      expect(colonFirst.get('Colon first')).to.equal('True but:this = is valid val')
    })
  })

  describe('matchEndOfHeadersSymbol()', function () {
    // const stubStream = new SevenZipStream({
    //   _commandArgs: ['a'],
    //   _matchBodyData: matchBodySymbol
    // })
    const opts = { $defer: true }
    opts._commandArgs = ['a']
    const stub = new SevenZipStream(opts)
    stub._matchBodyData = matchBodySymbol
    stub._matchEndOfHeaders = matchEndOfHeadersSymbol

    it('should return false on non match', function () {
      const r = matchEndOfHeadersSymbol(stub, 'Colon info: type colon info')
      expect(r).to.equal(false)
    })

    it('should return false on pseudo-empty line', function () {
      const r = matchEndOfHeadersSymbol(stub, '    ')
      expect(r).to.be.equal(false)
    })

    it('should be truthly on match of symbol-filname pair', function () {
      const r = matchEndOfHeadersSymbol(stub, '+ some/file.txt')
      let pass = false
      if (r) pass = true
      expect(pass).to.be.equal(true)
    })
  })

  describe('matchEndOfHeadersHyphen()', function () {
    it('should return null on non match', function () {
      const r = matchEndOfHeadersHyphen({}, 'Colon info: type colon info')
      expect(r).to.equal(null)
    })

    it('should return null on pseudo-empty line', function () {
      const r = matchEndOfHeadersHyphen({}, '    ')
      expect(r).to.be.equal(null)
    })

    it('should be truthly on match of hyphens', function () {
      const r = matchEndOfHeadersHyphen({}, '---- ---- ----')
      let pass = false
      if (r) pass = true
      expect(pass).to.be.equal(true)
    })

    it('should set _columnsPositions of the stream', function () {
      const stream = {}
      matchEndOfHeadersHyphen(stream, '---- ---- ----')
      expect(stream._columnsPositions).to.be.deep.equal([4, 9])
    })

    it('should set _columnsPositions for list command', function () {
      const stream = {}
      matchEndOfHeadersHyphen(stream, '------------------- ----- ------------ ------------  ------------------------')
      expect(stream._columnsPositions).to.be.deep.equal([19, 25, 38, 51, 52])
    })
  })

  describe('matchBodyProgress()', function () {
    it('should return null on non match', function () {
      const r = matchBodyProgress({}, 'Colon info: type colon info')
      expect(r).to.equal(null)
    })

    it('should return null on pseudo-empty line', function () {
      const r = matchBodyProgress({}, '    ')
      expect(r).to.be.equal(null)
    })

    it('should return progress info as int', function () {
      const digit1File = matchBodyProgress({}, '  1% 3')
      expect(digit1File.percent).to.equal(1)
      expect(digit1File.fileCount).to.equal(3)

      const digit2File = matchBodyProgress({}, ' 42% 234')
      expect(digit2File.percent).to.equal(42)
      expect(digit2File.fileCount).to.equal(234)

      const digit3File = matchBodyProgress({}, '100% 23877')
      expect(digit3File.percent).to.equal(100)
      expect(digit3File.fileCount).to.equal(23877)

      const digit1NoFile = matchBodyProgress({}, '  1%')
      expect(digit1NoFile.percent).to.equal(1)

      const digit2NoFile = matchBodyProgress({}, ' 42%')
      expect(digit2NoFile.percent).to.equal(42)

      const digit3NoFile = matchBodyProgress({}, '100%')
      expect(digit3NoFile.percent).to.equal(100)
    })
  })

  describe('matchBodySymbol()', function () {
    it('should return null on non match', function () {
      const r = matchBodySymbol({}, 'Colon info: type colon info')
      expect(r).to.equal(null)
    })

    it('should return null on pseudo-empty line', function () {
      const r = matchBodySymbol({}, '    ')
      expect(r).to.be.equal(null)
    })

    it('should return file on add', function () {
      const r = matchBodySymbol({}, '+ test/file')
      expect(r).to.be.an('object')
      expect(r['symbol']).to.equal('+')
      expect(r['file']).to.equal('test/file')
    })

    it('should return file on update', function () {
      const r = matchBodySymbol({}, 'U test/file')
      expect(r).to.be.an('object')
      expect(r['symbol']).to.equal('U')
      expect(r['file']).to.equal('test/file')
    })

    it('should return file on test', function () {
      const r = matchBodySymbol({}, 'T test/file')
      expect(r).to.be.an('object')
      expect(r['symbol']).to.equal('T')
      expect(r['file']).to.equal('test/file')
    })

    it('should return file on remaining', function () {
      const r = matchBodySymbol({}, 'R test/file')
      expect(r).to.be.an('object')
      expect(r['symbol']).to.equal('R')
      expect(r['file']).to.equal('test/file')
    })

    it('should return file on delete', function () {
      const r = matchBodySymbol({}, '. test/file')
      expect(r).to.be.an('object')
      expect(r['symbol']).to.equal('.')
      expect(r['file']).to.equal('test/file')
    })

    it('should return file on extracted', function () {
      const r = matchBodySymbol({}, '- test/file')
      expect(r).to.be.an('object')
      expect(r['symbol']).to.equal('-')
      expect(r['file']).to.equal('test/file')
    })

    it('should return file on rename', function () {
      const r = matchBodySymbol({}, '= test/file')
      expect(r).to.be.an('object')
      expect(r['symbol']).to.equal('=')
      expect(r['file']).to.equal('test/file')
    })

    it('should return file on Windows drive', function () {
      const r = matchBodySymbol({}, '+ C:\\test\\file')
      expect(r).to.be.an('object')
      expect(r['symbol']).to.equal('+')
      expect(r['file']).to.equal('C:\\test\\file')
    })

    it('should return file on Windows remote', function () {
      const r = matchBodySymbol({}, '+ \\test\\file')
      expect(r).to.be.an('object')
      expect(r['symbol']).to.equal('+')
      expect(r['file']).to.equal('\\test\\file')
    })

    it('should return file with emoji☕️', function () {
      const r = matchBodySymbol({}, 'T test/f☕️le')
      expect(r).to.be.an('object')
      expect(r['symbol']).to.equal('T')
      expect(r['file']).to.equal('test/f☕️le')
    })
  })

  describe('matchBodyHash()', function () {
    it('should return null on non match', function () {
      const r = matchBodyHash({}, 'Todo: 1')
      expect(r).to.be.equal(null)
    })

    it('should hash on file', function () {
      const r = matchBodyHash({}, '7E9C36FF6828353A             9  DirExt/sub1/sub1.txt')
      expect(r).to.be.an('object')
      expect(r['hash']).to.equal('7E9C36FF6828353A')
      expect(r['size']).to.equal(9)
      expect(r['file']).to.equal('DirExt/sub1/sub1.txt')
    })

    it('should return file on Windows drive', function () {
      const r = matchBodyHash({}, '7E9C36FF6828353A             9   C:\\test\\file')
      expect(r).to.be.an('object')
      expect(r['hash']).to.equal('7E9C36FF6828353A')
      expect(r['size']).to.equal(9)
      expect(r['file']).to.equal('C:\\test\\file')
    })

    it('should return file on Windows remote', function () {
      const r = matchBodyHash({}, '7E9C36FF6828353A             9   \\test\\file')
      expect(r).to.be.an('object')
      expect(r['file']).to.equal('\\test\\file')
      expect(r['hash']).to.equal('7E9C36FF6828353A')
      expect(r['size']).to.equal(9)
    })

    it('should return file with emoji☕️', function () {
      const r = matchBodyHash({}, '7E9C36FF6828353A             9   test/f☕️le')
      expect(r).to.be.an('object')
      expect(r['file']).to.equal('test/f☕️le')
      expect(r['hash']).to.equal('7E9C36FF6828353A')
      expect(r['size']).to.equal(9)
    })

    it('should match on directory', function () {
      const r = matchBodyHash({}, '               DirExt/sub1')
      expect(r).to.be.an('object')
      expect(r['file']).to.equal('DirExt/sub1')
    })

    it('should hash on non-sized file', function () {
      const r = matchBodyHash({}, '               DirExt/sub1/sub1.txt')
      expect(r).to.be.an('object')
      expect(r['hash']).to.equal(undefined)
      /* eslint-disable-next-line */
      expect(r['size']).to.be.NaN
      expect(r['file']).to.equal('DirExt/sub1/sub1.txt')
    })
  })

  describe('matchBodyList()', function () {
    it('should return null on non match', function () {
      const r = matchBodyList({}, 'Todo: 1')
      expect(r).to.be.equal(null)
    })

    it('should work with line full infos', function () {
      const stream = { _columnsPositions: [19, 25, 38, 51, 52] }
      const r = matchBodyList(stream, '2018-09-29 09:06:15 ....A            9           24  DirHex/42550418a4ef9')
      expect(r).to.be.deep.equal({
        datetime: new Date(Date.parse('2018-09-29T07:06:15.000Z')),
        attributes: '....A',
        size: 9,
        sizeCompressed: 24,
        file: 'DirHex/42550418a4ef9' })
    })

    it('should work with line not date', function () {
      const stream = { _columnsPositions: [19, 25, 38, 51, 52] }
      const r = matchBodyList(stream, '                    ....A            9           24  DirHex/42550418a4ef9')
      expect(r).to.be.deep.equal({
        datetime: undefined,
        attributes: '....A',
        size: 9,
        sizeCompressed: 24,
        file: 'DirHex/42550418a4ef9' })
    })

    it('should work with line not much', function () {
      const stream = { _columnsPositions: [19, 25, 38, 51, 52] }
      const r = matchBodyList(stream, '                    ....A                            DirHex/42550418a4ef9')
      expect(r).to.be.deep.equal({
        datetime: undefined,
        attributes: '....A',
        size: undefined,
        sizeCompressed: undefined,
        file: 'DirHex/42550418a4ef9' })
    })
  })

  describe('matchEndOfBodySymbol()', function () {
    const baseStream = { _matchBody: matchBodySymbol }

    it('should return null on non match', function () {
      const r = matchEndOfBodySymbol(baseStream, 'Todo: 1')
      expect(r).to.be.equal(null)
    })

    it('should be true on match', function () {
      const r = matchEndOfBodySymbol(baseStream, '')
      expect(r).to.be.equal(true)
    })

    it('should work when progress switch activated', function () {
      let stream = Object.assign({ _progressSwitch: true }, baseStream)
      const first = matchEndOfBodySymbol(stream, '   ')
      expect(first).to.be.equal(null)
      const second = matchEndOfBodySymbol(stream, '')
      expect(second).to.be.equal(true)
    })
  })

  describe('matchEndOfBodyHyphen()', function () {
    it('should return null on non match', function () {
      const r = matchEndOfBodyHyphen({}, 'Todo: 1')
      expect(r).to.be.equal(null)
    })

    it('should be null on match empty line', function () {
      const r = matchEndOfBodyHyphen({}, '')
      expect(r).to.be.equal(null)
    })

    it('should work when progress switch desactivated', function () {
      const stream = {
        _progressSwitch: false,
        _stage: STAGE_HEADERS
      }
      const first = matchEndOfBodyHyphen(stream, '---- ---- ----')
      let firstPass = false
      if (first === null) firstPass = true
      expect(firstPass).to.be.equal(true)
      const second = matchEndOfBodyHyphen(stream, '---- ---- ----')
      let secondPass = false
      if (second) secondPass = true
      expect(secondPass).to.be.equal(true)
    })

    it('should work when progress switch activated', function () {
      const stream = {
        _progressSwitch: true,
        _stage: STAGE_HEADERS
      }
      const first = matchEndOfBodyHyphen(stream, '---- ---- ----')
      let firstPass = false
      if (first === null) firstPass = true
      expect(firstPass).to.be.equal(true)
      const second = matchEndOfBodyHyphen(stream, '---- ---- ----')
      let secondPass = false
      if (second) secondPass = true
      expect(secondPass).to.be.equal(true)
    })
  })
})
