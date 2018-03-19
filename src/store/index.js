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
    buckets: [],
    currentBucket: {},
    imageList: [],
    prefixs: [],
    openPrefixs:[],
    imageDetail: {}
  },
  getters:{
    getDetail:({imageDetail}) => (hash) => imageDetail[ hash ],
  },
  mutations:{
    emptyImageList (state) {
      state.imageList = []
    },
    popOpenPrefixs (state) {
      state.openPrefixs.pop()
    },
    pushOpenPrefixs (state, payload) {
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
    setBucket ({buckets}, payload) {
      buckets.push(payload)
    },
    setCurrentBucket (state, payload) {
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
    async postSecrte ({commit}, {accessKey, secretKey}) {
      await ajax.post('/api/postSecret', {
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
      const {images, prefixs} = await ajax.get(`/api/getImages?bucket=${bucket}&prefix=${prefix}&domain=${domain}`)
      commit('setState', {
        imageList: images,
        prefixs: prefixs
      })
    }
  }
})

export default store
