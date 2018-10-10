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
