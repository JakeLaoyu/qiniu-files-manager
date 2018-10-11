
// 文件大小处理
export const Fsize = (value) => {
  let kb = Number(value / 1024).toFixed(2)
  if (kb < 1) return `${value} Byte`
  if (kb >= 1) {
    let mb = Number(kb / 1024).toFixed(2)
    if (mb < 1) return `${kb} Kb`
    if (mb >= 1) return `${mb} Mb`
  }
}

// putTime 处理
export const Ftime = (val) => {
  let format = 'Y-M-D h:m:s'
  let date = parseInt(Math.floor(val / 10000))
  let Udate = new Date(date)
  let Y = Udate.getFullYear()
  let M = (Udate.getMonth() + 1) < 10 ? '0' + (Udate.getMonth() + 1) : (Udate.getMonth() + 1)
  let D = Udate.getDate() < 10 ? '0' + Udate.getDate() : Udate.getDate()
  let h = Udate.getHours() < 10 ? '0' + Udate.getHours() : Udate.getHours()
  let m = Udate.getMinutes() < 10 ? '0' + Udate.getMinutes() : Udate.getMinutes()
  let s = Udate.getSeconds() < 10 ? '0' + Udate.getSeconds() : Udate.getSeconds()

  if (format.indexOf('Y') >= 0) {
    format = format.replace('Y', Y)
  }
  if (format.indexOf('M') >= 0) {
    format = format.replace('M', M)
  }
  if (format.indexOf('D') >= 0) {
    format = format.replace('D', D)
  }
  if (format.indexOf('h') >= 0) {
    format = format.replace('h', h)
  }
  if (format.indexOf('m') >= 0) {
    format = format.replace('m', m)
  }
  if (format.indexOf('s') >= 0) {
    format = format.replace('s', s)
  }

  return format
}
