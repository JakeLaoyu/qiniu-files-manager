<template>
<div class="layout">
  <Top
    @getList="getImagesList"
    @switchChange="switchChange"
    @deleteImage="clickFileKey=''"
    @inputNewPrefix="inputNewPrefix"
    >
  </Top>

  <div class="layout-content">
    <div class="layout-content-main">
      <Spin fix size="large" v-if="loading"></Spin>
      <Row :gutter="20">
        <Col span="16" push="8" class-name="contentmain">
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
            v-for="(folder,index) in prefixs"
            :key="index"
            type="folder"
            :item="folder"
            @clickPrefix="clickPrefix"
            />

          <template
            v-for="item in fileList"
            >
            <QimImageItem
              :item="item"
              :key="item.putTime"
              v-if="item.mimeType.indexOf('image')!=-1"
              type="image"
              :choosed="multipleSwitchFile.includes(item.key)"
              :domain="currentBucket.domain"
              @clickFile="clickFile"
              />
            <QimImageItem
              :item="item"
              :key="item.putTime"
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
              @imageload="handleScroll"
              />
          </transition>
        </Col>
      </Row>
    </div>
  </div>

</div>
</template>
<script>
import Top from './uiComponents/top.vue'

import {
  mapState,
  mapGetters,
  mapActions,
  mapMutations
} from 'vuex'

import {
  debounce
} from '@util'

export default {
  components: {
    Top
  },
  data () {
    return {
      clickFileKey: '',
      MultipleSwitch: false,
      clickFileDetail: {},
      newPrefix: '',
      loading: false,
      detailStyle: {
        maxHeight: 'calc(100vh - 240px)'
      }
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
    }
  },
  watch: {
    newPrefix () {
      this.handleScroll()
    },
    openPrefixs () {
      this.handleScroll()
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
    uploadfinish (payload) {
      if (payload.newPrefix.indexOf('/') >= 0) {
        this.setState({
          fileList: this.fileList,
          prefixs: this.prefixs.includes(payload.newPrefix.split('/')[0]) ? this.prefixs : [payload.newPrefix.split('/')[0], ...this.prefixs]
        })
      } else {
        this.unshift({
          ...payload.file,
          key: `${this.openPrefixs.length ? this.openPrefixs.join('/') + '/' : ''}${payload.file.key}`
        })
      }
    },
    clickFile (file) {
      this.clickFileKey = file.key
      this.clickFileDetail = file
      if (this.MultipleSwitch) {
        this.changeMultipleSwitchFile(file.key)
      }
      this.getFileDetail({
        bucket: this.currentBucket.bucket,
        file
      })
    },
    getImagesList () {
      const self = this
      this.clickFileKey = ''
      this.loading = true
      this.getList({
        bucket: this.currentBucket.bucket,
        domain: this.currentBucket.domain,
        prefix: this.openPrefixs.length ? this.openPrefixs.join('/') + '/' : '',
        cb () {
          self.loading = false
        }
      })
    },
    handleScroll () {
      var timeout
      var contentMain = document.querySelector('.contentmain')
      var detailDom = document.querySelector('.detail')
      var detailWrap = document.querySelector('.detail__wrap')
      var uploadDomRect = document.querySelector('.ivu-upload').getBoundingClientRect()
      if (detailDom && contentMain) {
        // var contentMainDomClientRect = contentMain.getBoundingClientRect()
        var detailDomRect = detailDom.getBoundingClientRect()
        if (window.scrollY >= 218) {
          var csstext = `top:${window.scrollY - 206}px;left:0;width:${detailDomRect.width}px;`
          this.detailStyle = {
            maxHeight: 'calc(100vh - 20px)'
          }
          detailDom.style = csstext
        } else {
          this.detailStyle = {
            maxHeight: `calc(100vh - ${83 + uploadDomRect.height + 30}px)`
          }
          detailDom.style = ''
        }
      }
      if (detailWrap) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          detailWrap.scrollTop = detailWrap.scrollHeight
        })
      }
    }
  },
  mounted () {
    window.addEventListener('scroll', debounce(this.handleScroll, 50))
    window.addEventListener('resize', debounce(this.handleScroll, 50))
    this.emptyMultipleSwitchFile()
    this.getImagesList()
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
.layout {
  width: 1200px;
  margin: 0 auto;
  border: none;
  &-content {
    min-height: calc(~"100vh - 90px");
    overflow: hidden;
    border-radius: 4px;
    width: 1200px;
    margin: 0 auto;
  }
  &-content-main {
    padding: 10px;
  }
}
.ivu-spin-fix {
  position: fixed;
}
</style>
