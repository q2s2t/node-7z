import { writeFileSync } from 'fs'

const base = [...new Array(8)]
const map = base.map(i => Math.random().toString(16).substring(2))
map.forEach(hex => writeFileSync(`${__dirname}/DirHex/${hex}`))
map.forEach(hex => writeFileSync(`${__dirname}/DirHex/sub1/${hex}`))
map.forEach(hex => writeFileSync(`${__dirname}/DirHex/sub2/${hex}`))
