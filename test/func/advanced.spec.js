/* global describe, it */
import { expect } from 'chai'
import Seven from '../../src/index.js'

const mockDir = './test/_mock'
const tmpDir = './test/_tmp'

describe('Functional: Advanced usage', function () {
  it('should add $raw arguments', function () {
    const archive = `${tmpDir}/advanced-raw.7z`
    const sourceRaw = [
      `${mockDir}/DirExt/*.txt`,
      `${mockDir}/DirExt/*.md`
    ]
    const seven = Seven.add(archive, `${mockDir}/DirExt/*.nop`, {
      recursive: true,
      $raw: sourceRaw,
      $defer: true
    })
    expect(seven._args).to.deep.equal([
      'a',
      './test/_tmp/advanced-raw.7z',
      './test/_mock/DirExt/*.nop',
      '-r',
      '-y',
      '-bb3',
      './test/_mock/DirExt/*.txt',
      './test/_mock/DirExt/*.md'
    ])
  })

  it('should work with context boolean flags', function () {
    const archive = `${tmpDir}/advanced-raw.7z`
    const sevenUnix = Seven.add(archive, 'nop', {
      caseSensitive: false,
      $defer: true
    })
    expect(sevenUnix._args).to.includes('-ssc-')
    const sevenWindows = Seven.add(archive, 'nop', {
      caseSensitive: true,
      $defer: true
    })
    expect(sevenWindows._args).to.includes('-ssc')
  })
})
