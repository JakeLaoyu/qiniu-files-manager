import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import {
  ajax
} from '@util'

Vue.use(Vuex)

const store = new Vuex.Store({
  plugins: [createPersistedState({
    // https://github.com/robinvdvleuten/vuex-persistedstate/issues/4
    reducer: (state) => {
      const reducerState = {...state}
      // state should be exclude
      delete reducerState.signatureHint
      delete reducerState.auditFailHint

      return reducerState
    }
  })],
  state:{
    buckets: [],  //buckets 列表
    currentBucket: {},  //当前bucket
    imageList: [],  //图片列表
    prefixs: [],  //当前访问路径的前缀
    openPrefixs:[], //已经打开的 prefix
    imageDetail: {} //图片详情
  },
  getters:{
    getDetail:({imageDetail}) => (hash) => imageDetail[ hash ],
  },
  mutations:{
    changeBucket (state, newBucket) {
      var index = state.buckets.findIndex(item => item.bucket === newBucket.bucket)

      if(state.currentBucket.bucket === state.buckets[ index ].bucket) {
        state.currentBucket = newBucket
      }

      state.buckets.splice(index, 1, newBucket)
    },
    delBucket (state, delBucket) {
      var index = state.buckets.findIndex(item => item.bucket === delBucket.bucket)
      state.buckets.splice(index, 1)
      if(state.currentBucket.bucket === delBucket.bucket) {
        state.openPrefixs = []
        state.imageList = []
        state.imageDetail = {}
      }
    },
    emptyImageList (state) {
      state.imageList = []
    },
    popOpenPrefixs (state) {
      state.imageDetail = {}
      state.openPrefixs.pop()
    },
    pushOpenPrefixs (state, payload) {
      state.imageDetail = {}
      state.openPrefixs.push(payload)
    },
    deleteImage (state, payload) {
      var indexOfStevie = state.imageList.findIndex(i => i.key === payload)
      state.imageList.splice(indexOfStevie, 1)
    },
    unshift (state, payload) {
      state.imageList.unshift(payload)
    },
    setImageDetail (state, payload) {
      state.imageDetail = {
        ...state.imageDetail,
        [ payload.hash ]: payload
      }
    },
    setBuckets (state, payload) {
      state.buckets.push(payload)
    },
    setCurrentBucket (state, payload) {
      state.imageList = []
      state.openPrefixs = []
      state.currentBucket = {
        ...payload
      }
    },
    setState (state, payload) {
      state.imageList = payload.imageList
      state.prefixs = payload.prefixs
    }
  },
  actions: {
    /**
     * 获取图片详情
     * @param  {[type]}  commit [description]
     * @param  {String}  bucket 图片所在仓库
     * @param  {String}  image  图片的key
     * @return {undefined}        [description]
     */
    async getImageDetail ({commit}, {bucket, image}) {
      const {info} = ajax.get(`/api/detail?key=${image.key}&bucket=${bucket}`)

      commit('setImageDetail', {
        ...image,
        ...info
      })
    },
    /**
     * 提交AK、SK
     * @param  {[type]}  commit    [description]
     * @param  {String}  accessKey ak
     * @param  {String}  secretKey sk
     * @return {undefined}           [description]
     */
    postSecrte ({commit}, {accessKey, secretKey}) {
      return ajax.post('/api/postSecret', {
        accessKey: accessKey,
        secretKey: secretKey
      })
    },
    /**
     * 获取图片列表
     * @param  {[type]}  commit       [description]
     * @param  {String}  bucket       仓库名
     * @param  {String}  domain       仓库绑定域名
     * @param  {String}  [prefix=''}] 前缀 默认为空
     * @return {undefined}              [description]
     */
    async getList ( {commit}, {bucket, domain, prefix = ''}) {
      commit('emptyImageList')
      const {images, prefixs} = await ajax.get(`/api/getImages?bucket=${bucket}&prefix=${prefix}&domain=${domain}`)
      commit('setState', {
        imageList: images,
        prefixs: prefixs
      })
    }
  }
})

export default store
