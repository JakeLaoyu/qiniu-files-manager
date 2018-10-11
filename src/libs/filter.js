
// 文件大小处理
export const Fsize = (value) => {
  console.log('value', value)
  let kb = Number(value / 1024).toFixed(2)
  console.log('kb', kb)
  if (kb < 1) return `${value} Byte`
  if (kb >= 1) {
    let mb = Number(kb / 1024).toFixed(2)
    console.log('mb', mb)
    console.log(mb < 1)
    if (mb < 1) return `${kb} Kb`
    if (mb >= 1) return `${mb} Mb`
  }
}
