import axios from 'axios'
import Vue from 'vue'
import iView from 'iview'

export const baseURL = process.env.NODE_ENV === 'development' ? '//dev.jakeyu.top:8080' : location.origin

export const ajax = axios.create({
  baseURL: baseURL,
  timeout: 30000,
  responseType: 'json'
})

export const debounce = (fn, delay) => {
  let timer = null
  return function () {
    let context = this
    let args = arguments
    clearTimeout(timer)
    timer = setTimeout(function () {
      fn.apply(context, args)
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
