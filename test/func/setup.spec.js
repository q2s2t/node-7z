/* globals before, after */
import { copyFileSync } from 'fs'
import rimraf from 'rimraf'


const mockDir = './test/_mock'
const tmpDir = './test/_tmp'

before(function (done) {
  rimraf.sync(`${tmpDir}/*`)
  const bin = `${mockDir}/Binaries/7z-${process.platform}`
  let dest = `${tmpDir}/Seven Zip`
  if (process.platform === 'win32') {
    dest = dest + '.exe'
  }
  copyFileSync(bin, dest)
  copyFileSync(bin, './7z.exe')
  done()
})

after(function (done) {
  rimraf.sync(`${tmpDir}/*`)
  done()
})

export default { before, after }
