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
  state: {
    buckets: [], // buckets 列表
    currentBucket: {}, // 当前bucket
    fileList: [], // 图片列表
    prefixs: [], // 当前访问路径的前缀
    openPrefixs: [], // 已经打开的 prefix
    fileDetail: {}, // 图片详情
    multipleSwitchFile: [] // 多选选中文件
  },
  getters: {
    getDetail: ({fileDetail}) => (key) => fileDetail[ key ]
  },
  mutations: {
    chooseAllMultipleSwitchFile (state, payload) {
      state.fileList.forEach(item => {
        if (payload && !state.multipleSwitchFile.includes(item.key)) {
          state.multipleSwitchFile.push(item.key)
        } else if (!payload && state.multipleSwitchFile.includes(item.key)) {
          state.multipleSwitchFile.splice(state.multipleSwitchFile.indexOf(item.key), 1)
        }
      })
    },
    emptyMultipleSwitchFile (state) {
      state.multipleSwitchFile = []
    },
    changeMultipleSwitchFile (state, payload) {
      var index = state.multipleSwitchFile.indexOf(payload)
      if (index >= 0) {
        state.multipleSwitchFile.splice(index, 1)
      } else {
        state.multipleSwitchFile.push(payload)
      }
    },
    changeBucket (state, newBucket) {
      var index = state.buckets.findIndex(item => item.bucket === newBucket.bucket)

      if (state.currentBucket.bucket === state.buckets[ index ].bucket) {
        state.currentBucket = newBucket
      }

      state.buckets.splice(index, 1, newBucket)
    },
    delBucket (state, delBucket) {
      var index = state.buckets.findIndex(item => item.bucket === delBucket.bucket)
      state.buckets.splice(index, 1)
      if (state.currentBucket.bucket === delBucket.bucket) {
        state.openPrefixs = []
        state.fileList = []
        state.fileDetail = {}
      }
    },
    emptyFileList (state) {
      state.fileList = []
    },
    changeOpenPrefixs (state, payload) {
      state.fileDetail = {}
      if (payload.type === 'pop') {
        state.openPrefixs.pop()
      } else if (payload.type === 'push') {
        state.openPrefixs.push(payload.val)
      } else if (payload.type === 'jump') {
        state.openPrefixs = payload.val
      }
    },
    deleteImage (state, payload) {
      var indexOfStevie = state.fileList.findIndex(i => i.key === payload)
      if (indexOfStevie !== -1) {
        state.fileList.splice(indexOfStevie, 1)
      }
    },
    unshift (state, payload) {
      state.fileList.unshift(payload)
    },
    setFileDetail (state, payload) {
      state.fileDetail = {
        ...state.fileDetail,
        [ payload.key ]: payload
      }
    },
    setBuckets (state, payload) {
      state.buckets.push(payload)
    },
    setCurrentBucket (state, payload) {
      state.fileList = []
      state.openPrefixs = []
      state.currentBucket = {
        ...payload
      }
    },
    setState (state, payload) {
      state.fileList = payload.fileList
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
    async getFileDetail ({commit}, {bucket, file}) {
      const {info} = await ajax.get(`/api/detail?key=${file.key}&bucket=${bucket}`)

      commit('setFileDetail', {
        ...file,
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
    async getList ({commit, state}, {search = '', cb}) {
      var bucket = state.currentBucket.bucket
      var domain = state.currentBucket.domain
      var prefix = ''
      if (!search) {
        prefix = state.openPrefixs.length ? state.openPrefixs.join('/') + '/' : ''
        commit('emptyFileList')
      }
      const {images, prefixs} = await ajax.get(`/api/getImages?bucket=${bucket}&prefix=${prefix}&domain=${domain}&search=${search}`)
      if (!images) return
      if (!search) {
        images.forEach(item => {
          item.key = prefix + item.key
        })
        commit('setState', {
          fileList: images,
          prefixs: prefixs
        })
      } else {
        return images
      }
      if (cb) {
        cb()
      }
    }
  }
})

export default store
