import axios from 'axios'
import iView from 'iview'
import Vue from 'vue'

export const baseURL = process.env.NODE_ENV === 'development' ? '//dev.jakeyu.top:8080' : location.origin

export const ajax = axios.create({
  baseURL: baseURL,
  timeout: 30000,
  responseType: 'json'
})

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
    if (typeof data.message === 'string') Vue.prototype.$Message.error(data.message)
    if (Array.isArray(data.message)) {
      data.message.forEach(item => Vue.prototype.$Message.error(item))
    }
    // return Promise.reject(new Error(data.message))
  }
  return data
}, error =>
  Promise.reject(error)
)
