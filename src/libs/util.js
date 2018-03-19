import axios from 'axios'
import Vue from 'vue'

export const baseURL = process.env.NODE_ENV == 'development' ? '//dev.jakeyu.top:8080' : location.origin

export const ajax = axios.create({
  baseURL: baseURL,
  timeout: 30000,
  responseType: 'json'
})

ajax.interceptors.response.use(({data = {}, request}) => {
  if (data.code !== 1) {
    Vue.prototype.$Message.error(data.message)
    // return Promise.reject(new Error(data.message))
  }
  return data
}, error =>
  Promise.reject(error)
)
