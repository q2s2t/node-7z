export function add (stream, infos) {
  infos.forEach(function (info) {
    Object.assign(stream, info)
  })
}
