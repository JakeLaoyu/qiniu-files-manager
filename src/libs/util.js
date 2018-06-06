import axios from 'axios'
import Vue from 'vue'
import iView from 'iview'

export const baseURL = process.env.NODE_ENV === 'development' ? '//dev.jakeyu.top:8080' : location.origin

export const ajax = axios.create({
  baseURL: baseURL,
  timeout: 30000,
  responseType: 'json'
})

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

axios.interceptors.request.use(function (config) {
  // Do something before request is sent
  iView.LoadingBar.start()
  return config
}, function (error) {
  // Do something with request error
  return Promise.reject(error)
})

ajax.interceptors.response.use(({data = {}, request}) => {
  iView.LoadingBar.finish()
  if (data && data.code !== 1) {
    Vue.prototype.$Message.error(data.message)
    // return Promise.reject(new Error(data.message))
  }
  return data
}, error =>
  Promise.reject(error)
)
