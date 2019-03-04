<template>
<div class="layout">
  <Top
    :filterFileList="filterFileList"
    @getList="getImagesList"
    @switchChange="switchChange"
    @deleteImage="clickFileKey=''"
    @inputNewPrefix="inputNewPrefix"
    @handleSearch="(val)=>{this.searchVal = val}"
    >
  </Top>

  <div class="layout-content">
    <div class="layout-content-main" :style="layoutContentMainStyle">
      <ASpin size="large" :spinning="loading">
        <Row :gutter="20">
          <Col span="16" push="8" class-name="contentmain" ref="contentmain" :class="{ 'beautyScroll': isWin }" :style="contentmainStyle">
            <QimImageItem
              v-if="!openPrefixs.length && !fileList.length"
              type="empty"
              />

            <QimImageItem
              v-if="openPrefixs.length"
              type="return"
              @returnDirectory="returnDirectory"
              />

            <QimImageItem
              v-for="(folder,index) in filterPrefixs"
              :key="index"
              type="folder"
              :item="folder"
              @clickPrefix="clickPrefix"
              />

            <template
              v-for="(item,index) in filterFileList"
              >
              <QimImageItem
                :item="item"
                :key="index + filterPrefixs.length"
                v-if="item.mimeType.indexOf('image')!=-1"
                type="image"
                :choosed="multipleSwitchFile.includes(item.key)"
                :domain="currentBucket.domain"
                :isPrivate="currentBucket.isPrivate"
                @clickFile="clickFile"
                />
              <QimImageItem
                :item="item"
                :key="index + filterPrefixs.length"
                v-else
                :type="item.mimeType"
                :choosed="multipleSwitchFile.includes(item.key)"
                :domain="currentBucket.domain"
                @clickFile="clickFile"
                />
            </template>
          </Col>

          <Col span="8" pull="16" class-name="left-part">
            <QimUpload
              @uploadfinish="uploadfinish"
              :newPrefix="newPrefix"
              >
            </QimUpload>

            <transition name="fade">
              <QimDetail
                :detail="fileDetail || clickFileDetail"
                :detailStyle="detailStyle"
                v-if="clickFileKey"
                @deleteImage="clickFileKey=''"
                @imageload="handleDetailScroll"
                />
            </transition>
          </Col>
        </Row>
      </ASpin>
    </div>
  </div>

</div>
</template>
<script>
import Top from './uiComponents/top.vue'
import { isWin, debounce, ajax, randomWord, throttle } from '@/libs/util'

import {
  mapState,
  mapGetters,
  mapActions,
  mapMutations
} from 'vuex'

export default {
  components: {
    Top
  },
  data () {
    return {
      isWin,
      clickFileKey: '',
      MultipleSwitch: false,
      clickFileDetail: {},
      newPrefix: '',
      loading: false,
      searchVal: '',
      contentmainStyle: {},
      layoutContentMainStyle: {},
      query: {
        pagesize: 1000
      },
      detailStyle: {
        maxHeight: 'calc(100vh - 240px)'
      },
      domCache: {}
    }
  },
  computed: {
    ...mapState([
      'buckets',
      'currentBucket',
      'fileList',
      'prefixs',
      'openPrefixs',
      'multipleSwitchFile'
    ]),
    ...mapGetters([
      'getDetail'
    ]),
    fileDetail () {
      return this.getDetail(this.clickFileKey)
    },
    filterFileList () {
      if (!this.searchVal) return this.fileList
      let searchReg = new RegExp(this.searchVal)
      return this.fileList.filter(item => searchReg.test(item.key))
    },
    filterPrefixs () {
      if (!this.searchVal) return this.prefixs
      let searchReg = new RegExp(this.searchVal)
      return this.prefixs.filter(item => searchReg.test(item))
    }
  },
  watch: {
    newPrefix () {
      this.$nextTick(() => {
        this.handleDetailScroll()
      })
    },
    openPrefixs () {
      this.$nextTick(() => {
        this.handleDetailScroll()
        this.resetContentHeight()
      })
    }
  },
  methods: {
    ...mapActions([
      'getList',
      'postSecrte',
      'getFileDetail'
    ]),
    ...mapMutations([
      'unshift',
      'changeOpenPrefixs',
      'changeMultipleSwitchFile',
      'emptyMultipleSwitchFile',
      'setState'
    ]),
    inputNewPrefix (newPrefix) {
      this.newPrefix = newPrefix
    },
    switchChange (val) {
      this.MultipleSwitch = val
      if (!this.MultipleSwitch) {
        this.emptyMultipleSwitchFile()
      }
    },
    clickPrefix (folder) {
      this.changeOpenPrefixs({
        type: 'push',
        val: folder
      })
      this.getImagesList()
    },
    returnDirectory () {
      this.changeOpenPrefixs({
        type: 'pop'
      })
      this.getImagesList()
    },
    async uploadfinish (payload) {
      if (payload.newPrefix.indexOf('/') >= 0) {
        this.setState({
          fileList: this.fileList,
          prefixs: this.prefixs.includes(payload.newPrefix.split('/')[0]) ? this.prefixs : [payload.newPrefix.split('/')[0], ...this.prefixs]
        })
      } else {
        let key = `${this.openPrefixs.length ? this.openPrefixs.join('/') + '/' : ''}${payload.file.key}`
        if (this.currentBucket.isPrivate) {
          const { token } = await ajax.get(`/api/getPrivateToken?key=${key}&domain=${window.location.protocol + this.currentBucket.domain}`)
          payload.file.private = token
        }
        this.unshift({
          ...payload.file,
          key
        })
      }
    },
    async clickFile (file) {
      this.clickFileKey = file.key
      this.clickFileDetail = file
      if (this.MultipleSwitch) {
        this.changeMultipleSwitchFile(file.key)
      }
      await this.getFileDetail({
        bucket: this.currentBucket.bucket,
        file
      })
      this.handleDetailScroll()
    },
    handleDetailScroll () {
      var detailWrap = document.querySelector('.detail__wrap')
      var IvuUpload = document.querySelector('.ivu-upload')
      if (detailWrap && IvuUpload) {
        var uploadDomRect = IvuUpload.getBoundingClientRect()
        this.detailStyle = {
          maxHeight: `calc(100vh - ${20 + uploadDomRect.height + 8 + 10 + 102 + document.querySelector('.ivu-breadcrumb').offsetHeight}px)`
        }
        this.$nextTick(() => {
          detailWrap.scrollTop = detailWrap.scrollHeight
        })
      }
    },
    async getImagesList () {
      this.clickFileKey = ''
      this.loading = true
      await this.getList({
        query: this.query
      })
      this.loading = false
      this.$nextTick(() => {
        this.domAddPosition()
      })
    },
    resetContentHeight () {
      if (!document.querySelector('.ivu-breadcrumb')) return
      this.contentmainStyle = {
        height: `calc(100vh - ${102 + document.querySelector('.ivu-breadcrumb').offsetHeight + 20}px)`
      }
      this.layoutContentMainStyle = {
        height: `calc(100vh - ${102 + document.querySelector('.ivu-breadcrumb').offsetHeight}px)`
      }
    },
    contentmainScroll () {
      const contentmain = this.$refs.contentmain.$el
      const items = document.querySelectorAll('.contentmain .item')
      items.forEach(itemImage => {
        if (Number(itemImage.getAttribute('data-top')) + itemImage.clientHeight < contentmain.scrollTop ||
         (contentmain.scrollTop + contentmain.clientHeight < Number(itemImage.getAttribute('data-top')))) {
          if (itemImage.getAttribute('data-key')) return
          let key = randomWord(true, 3, 32)
          while (this.domCache[key]) {
            key = randomWord(true, 3, 32)
          }
          let arr = []
          for (let index = 0; index < itemImage.children.length; index++) {
            arr.push(itemImage.children[index])
            itemImage.children[index].parentNode.removeChild(itemImage.children[index])
          }
          this.domCache[key] = arr
          itemImage.setAttribute('data-key', key)
        } else {
          let key = itemImage.getAttribute('data-key')
          if (!key) return
          this.domCache[key].forEach(child => {
            itemImage.appendChild(child)
          })
          delete this.domCache[key]
          itemImage.removeAttribute('data-key')
        }
      })
    },
    domAddPosition () {
      document.querySelectorAll('.contentmain .item').forEach(item => {
        item.setAttribute('data-top', item.offsetTop)
      })
      this.$nextTick(this.contentmainScroll)
    }
  },
  mounted () {
    this.emptyMultipleSwitchFile()
    this.getImagesList()
    this.resetContentHeight()
    this.$refs.contentmain.$el.addEventListener('scroll', throttle(this.contentmainScroll, 10, 20))

    window.onresize = debounce(() => {
      this.resetContentHeight()
      this.handleDetailScroll()
    }, 500)
  },
  async created () {
    await this.postSecrte({
      accessKey: this.currentBucket.AccessKey,
      secretKey: this.currentBucket.SecretKey
    })
  }
}
</script>
<style lang="less" scoped>
.contentmain {
  height: calc(~"100vh - 123px");
  overflow-y: scroll;
  transform: translateZ(0);
  position: relative;
  font-size: 0;
}
.layout {
  width: 1200px;
  margin: 0 auto;
  border: none;
  &-content {
    border-radius: 4px;
    width: 1200px;
    margin: 0 auto;
  }
  &-content-main {
    padding: 10px;
    height: calc(~"100vh - 103px");
    box-sizing: border-box;
  }
}
.ivu-spin-fix {
  position: fixed;
}
</style>
