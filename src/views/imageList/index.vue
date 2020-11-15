<template>
<div class="layout">
  <Top
    :filterFileList="filterFileList"
    @getList="reGetImagesList"
    @switchChange="switchChange"
    @deleteImage="clickFileKey=''"
    @inputNewPrefix="inputNewPrefix"
    @handleSearch="(val)=>{this.searchVal = val}"
    >
  </Top>

  <div class="layout-content">
    <div class="layout-content-main" :style="layoutContentMainStyle">
      <Row :gutter="20">
        <Col
          span="16"
          push="8"
          class-name="contentmain"
          ref="contentmain"
          :class="{ 'beautyScroll': isWin }"
          :style="contentmainStyle"
        >
          <div
            v-infinite-scroll="getImagesList"
            :infinite-scroll-disabled="loadingPagination"
          >
            <span>
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
                :key="folder + index"
                type="folder"
                :item="folder"
                @clickPrefix="clickPrefix"
                />
            </span>

            <span>
              <template
                v-for="(item, index) in filterFileList"
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
            </span>

            <div class="layout-content-main__spin">
              <a-spin v-show="loadingPagination && !loadingPaginationFinished" tip="Loading..."></a-spin>
            </div>
          </div>
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
import infiniteScroll from 'vue-infinite-scroll'
import { isWin, debounce, ajax, randomWord } from '@/libs/util'

import {
  mapState,
  mapGetters,
  mapActions,
  mapMutations
} from 'vuex'

export default {
  directives: {infiniteScroll},

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
      loadingPagination: false,
      loadingPaginationFinished: false,
      searchVal: '',
      contentmainStyle: {},
      layoutContentMainStyle: {},
      query: {
        nextMarker: '',
        pagesize: 1000
      },
      detailStyle: {
        maxHeight: 'calc(100vh - 240px)'
      },
      domCache: {},
      throttleContentmainScroll: debounce(this.contentmainScroll, 500),
      handleResize: debounce(() => {
        this.resetContentHeight()
        this.handleDetailScroll()
      }, 500)
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
    searchVal (val, oldval) {
      if (oldval) return
      const items = document.querySelectorAll('.contentmain .item')
      items.forEach(itemImage => {
        // 在显示区域内
        let key = itemImage.getAttribute('data-key')
        key && this.domCache[key] && this.domCache[key].forEach(child => {
          itemImage.appendChild(child)
        })
        delete this.domCache[key]
        itemImage.removeAttribute('data-key')
        itemImage.removeAttribute('data-top')
      })
    },
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
      this.reGetImagesList()
    },

    returnDirectory () {
      this.changeOpenPrefixs({
        type: 'pop'
      })
      this.reGetImagesList()
    },

    reGetImagesList () {
      this.query.nextMarker = ''
      this.loadingPaginationFinished = false
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
      if (this.loadingPagination || this.loadingPaginationFinished) return

      this.clickFileKey = ''
      this.loadingPagination = true
      const res = await this.getList({
        query: this.query
      }) || {}
      this.query.nextMarker = res.nextMarker || ''

      // 没有返回 nextMarker ，表示加载完成
      if (!res.nextMarker) {
        this.loadingPaginationFinished = true
      }

      this.$nextTick(() => {
        this.domAddPosition()
        this.loadingPagination = false
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
          //  不在显示区域内
          if (itemImage.getAttribute('data-key')) return
          let key = randomWord(true, 3, 32)
          while (this.domCache[key]) {
            key = randomWord(true, 3, 32)
          }
          let arr = []
          for (let index = 0; index < itemImage.children.length; index++) {
            if (itemImage.children[index].localName === 'img') {
              arr.push(itemImage.children[index])
              itemImage.children[index].parentNode.removeChild(itemImage.children[index])
            }
          }
          this.domCache[key] = arr
          itemImage.setAttribute('data-key', key)
        } else {
          // 在显示区域内
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
    this.resetContentHeight()
    this.$refs.contentmain.$el.addEventListener('scroll', this.throttleContentmainScroll)

    window.onresize = this.handleResize
  },
  async created () {
    await this.postSecrte({
      accessKey: this.currentBucket.AccessKey,
      secretKey: this.currentBucket.SecretKey
    })
  },
  updated () {
    this.domAddPosition()
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

    &__spin {
      text-align: center;
    }
  }
}
.ivu-spin-fix {
  position: fixed;
}
</style>
