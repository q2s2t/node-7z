/* globals before, after */
import { copyFileSync } from 'fs'
import { sync as rimraf } from 'rimraf'

const mockDir = './test/_mock'
const tmpDir = './test/_tmp'

before(function (done) {
  let bin = `${mockDir}/Binaries/7z-${process.platform}`
  let dest = `${tmpDir}/Seven Zip`
  if (process.platform === 'win32') {
    dest = dest + '.exe'
  }
  copyFileSync(bin, dest)
  copyFileSync(bin, './7z.exe')
  done()
})

after(function (done) {
  rimraf(`${tmpDir}/*`)
  done()
})
