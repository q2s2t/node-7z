import { copyFileSync } from 'fs'

const mockDir = './test/_mock'
const tmpDir = './test/_tmp'

export function getAlternateBinByPlatform () {
  let bin = `${mockDir}/Binaries/7z-${process.platform}`
  let dest = `${tmpDir}/Seven Zip`
  if (process.platform === 'win32') {
    dest = dest + '.exe'
  }
  copyFileSync(bin, dest)
  copyFileSync(bin, './7z.exe')
}
