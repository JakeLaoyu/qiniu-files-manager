export { ajax, baseURL } from './ajax'

export const isWin = /windows/ig.test(window.navigator.userAgent)

/**
 * 去抖函数
 * @param  {function} fun   要执行的函数
 * @param  {Number} delay 延迟
 * @return {[type]}       [description]
 */
export const debounce = (fn, delay) => {
  // 持久化一个定时器 timer
  let timer = null
  // 闭包函数可以访问 timer
  return function () {
    // 如果事件被触发，清除 timer 并重新开始计时
    clearTimeout(timer)
    timer = setTimeout(function () {
      fn()
    }, delay)
  }
}

/**
 *
 * @param {Function} fun 要执行的函数
 * @param {Number} delay 延迟
 * @param {Number} time  time时间内必需执行一次
 */
export const throttle = (fun, delay, time) => {
  let timeout = null
  let startTime = new Date()
  return function () {
    clearTimeout(timeout)
    let context = this
    let currentTime = new Date()
    if (currentTime - startTime > time) {
      fun.apply(context, [...arguments])
      startTime = currentTime
    } else {
      timeout = setTimeout(() => {
        fun.apply(context, [...arguments])
      }, delay)
    }
  }
}

/**
 * 对象转换为get请求 query
 * @param {Object} obj 要转化的对象
 */
export const objToQuery = (obj) => {
  if (!obj) return ''
  let strArr = []
  Object.keys(obj).forEach(item => {
    strArr.push(`${item}=${obj[item]}`)
  })
  return strArr.join('&')
}

/**
 * randomWord 产生任意长度随机字母数字组合
 * @param randomFlag 是否任意长度 min-任意长度最小位[固定位数] max-任意长度最大位
 * @param min
 * @param max
 * @returns {string}
 */
export const randomWord = (randomFlag, min, max) => {
  let str = ''
  let range = min
  let arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

  // 随机产生
  if (randomFlag) {
    range = Math.round(Math.random() * (max - min)) + min
  }
  for (var i = 0; i < range; i++) {
    let pos = Math.round(Math.random() * (arr.length - 1))
    str += arr[pos]
  }
  return str
}
