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
            v-for="(folder,index) in filterPrefixs"
            :key="index"
            type="folder"
            :item="folder"
            @clickPrefix="clickPrefix"
            />

          <template
            v-for="item in filterFileList"
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
              @imageload="handleDetailScroll"
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
      searchVal: '',
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
      this.handleDetailScroll()
    },
    openPrefixs () {
      this.handleDetailScroll()
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
    handleDetailScroll () {
      var timeout
      var detailWrap = document.querySelector('.detail__wrap')
      var IvuUpload = document.querySelector('.ivu-upload')
      if (detailWrap && IvuUpload) {
        var uploadDomRect = IvuUpload.getBoundingClientRect()
        detailWrap.style.maxHeight = `calc(100vh - ${20 + uploadDomRect.height + 8 + 10 + 72}px)`
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          detailWrap.scrollTop = detailWrap.scrollHeight
        })
      }
    },
    getImagesList () {
      const self = this
      this.clickFileKey = ''
      this.loading = true
      this.getList({
        cb () {
          self.loading = false
        }
      })
    }
  },
  mounted () {
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
.contentmain {
  height: calc(~"100vh - 92px");
  overflow-y: scroll;
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
    height: calc(~"100vh - 72px");
    box-sizing: border-box;
  }
}
.ivu-spin-fix {
  position: fixed;
}
</style>
