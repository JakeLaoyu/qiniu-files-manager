<template>
<div class="detail">
  <div class="detail__wrap" :class="{ 'beautyScroll': isWin }" :style="detailStyle">
    <div class="detail__img">
      <Spin size="large" fix v-if="imgLoading"></Spin>
      <img :src="fileUrl" @load="imgLoad" v-if="detail.mimeType.split('/')[0]==='image'">
      <div class="dplayer__wrap" v-show="detail.mimeType.split('/')[0]==='video'">
        <div id="dplayer"></div>
      </div>
      <QimIcon
        v-if="!['video','image'].includes(detail.mimeType.split('/')[0])"
        :icon="detail.mimeType.split('/')[detail.mimeType.split('/').length-1]"
        size="80"
        />
    </div>
    <div class="detail__info">
      <div class="detail__name">{{ detail.key.split('/')[detail.key.split('/').length - 1] }}</div>
      <div class="detail__url"><span>url:</span> {{ fileUrl }}</div>
      <div class="detail__fsize"><span>fsize:</span> {{ detail.fsize | FilterFsize }}</div>
      <div class="detail__putTime"><span>putTime:</span> {{ detail.putTime | FilterFtime }}</div>
      <div :class="`detail__${detailKey}`" v-for="detailKey in Object.keys(detail)" :key="detailKey" v-if="!['fsize','putTime'].includes(detailKey)"><span>{{detailKey}}:</span> {{ detail[detailKey] }}</div>

      <div class="detail__operating">
        <ButtonGroup>
          <Button type="ghost" :loading="delLoading" @click="delImage">
            <span v-if="!delLoading">删除</span>
            <span v-else>Loading...</span>
          </Button>
          <Button type="ghost" @click="moveImage">移动或者重命名</Button>
        </ButtonGroup>

        <div style="margin-top:20px;">
          <a :href="fileUrl" target="_blank"><Button type="ghost" icon="eye">打开</Button></a>
          <Button type="primary" id="copyBtn" icon="ios-copy">复制链接</Button>
        </div>
      </div>
    </div>

  </div>

  <QimModal :isShow="showModal" title="移动或重命名" @ok="saveMove" :image="detail" type="move" :loading="modalLoading" @closeModal="closeModal" />
</div>
</template>
<script>
import {
  mapState,
  mapMutations
} from 'vuex'

import { ajax, isWin } from '@util'

import Clipboard from 'clipboard'
import DPlayer from 'dplayer'
import 'dplayer/dist/DPlayer.min.css'

export default {
  props: {
    detail: {
      type: Object
    },
    detailStyle: {
      type: Object
    }
  },
  data () {
    return {
      isWin,
      delLoading: false,
      showModal: false,
      modalLoading: false,
      imgLoading: true
    }
  },
  computed: {
    ...mapState([
      'currentBucket',
      'openPrefixs'
    ]),
    fileUrl () {
      return this.currentBucket.isPrivate ? `${this.currentBucket.domain}${this.detail.key}?${this.detail.private}` : this.currentBucket.domain + this.detail.key
    }
  },
  watch: {
    detail (val, oldVal) {
      if (this.detail.mimeType.split('/')[0] === 'image' && val.key !== oldVal.key) {
        this.imgLoading = true
      } else if (this.detail.mimeType.split('/')[0] === 'video' && val.key !== oldVal.key) {
        this.videoInit()
      }
    }
  },
  methods: {
    ...mapMutations([
      'deleteImage'
    ]),
    videoInit () {
      this.dp = new DPlayer({
        container: document.getElementById('dplayer'),
        autoplay: false,
        preload: false,
        lang: 'zh-cn',
        video: {
          url: this.currentBucket.domain + this.detail.key
        }
      })
    },
    imgLoad () {
      this.imgLoading = false
      this.$emit('imageload')
    },
    closeModal () {
      this.showModal = false
    },
    delImage () {
      this.delLoading = true
      var filename = this.detail.key

      this.$Modal.confirm({
        title: '确认删除',
        content: '是否删除: ' + '<span style="color:red;">' + filename + '</span>',
        loading: true,
        onOk: async () => {
          let data = {
            key: this.detail.key,
            bucket: this.currentBucket.bucket
          }
          await ajax.post('/api/delImage', data)
          this.delLoading = false
          this.deleteImage(this.detail.key)
          this.$Message.success('删除成功')
          this.$Modal.remove()
          this.$emit('deleteImage')
        },
        onCancel: () => {
          this.delLoading = false
        }
      })
    },
    moveImage () {
      this.showModal = true
    },
    async saveMove (moveTo) {
      this.modalLoading = true
      if (moveTo === this.detail.key) {
        this.modalLoading = false
        this.showModal = false
        return
      }

      ajax.post('/api/moveImage', {
        bucket: this.currentBucket.bucket,
        key: this.detail.key,
        newKey: moveTo
      })

      this.modalLoading = false
      this.showModal = false

      location.reload()
    },
    copyUrl () {
      if (this.clipboard) this.clipboard.destroy()
      this.clipboard = new Clipboard('#copyBtn', {
        text: () => encodeURI(this.fileUrl)
      })
      this.clipboard.on('success', e => {
        this.$Message.success('复制成功 ' + this.fileUrl)
      })
    }
  },
  mounted () {
    if (this.detail.mimeType.split('/')[0] !== 'image') {
      this.imgLoading = false
    }
    if (this.detail.mimeType.split('/')[0] === 'video') {
      this.videoInit()
    }
    this.copyUrl()
  },
  beforeDestroy () {
    if (this.clipboard) this.clipboard.destroy()
  },
  beforeUpdate () {
    if (this.clipboard) this.clipboard.destroy()
  },
  updated () {
    this.copyUrl()
  }
}
</script>
<style lang="less" scoped>
.detail {
  background: #fff;
  font-size: 14px;
  color: #666;
  padding: 10px 0;
  position: relative;
  box-sizing: border-box;
  min-height: 100px;
  transition: top 0.5s;
  top: 0;
  &__wrap{
    overflow-y: scroll;
    padding: 0 10px;
    box-sizing: border-box;
  }
  &__info > div {
    word-break: break-all;
    margin-bottom: 10px;
    span {
      color: #333;
    }
  }
  &__img {
    min-height: 100px;
    position: relative;
    text-align: center;
    font-size: 0;
    img {
      width: 100%;
    }
  }
  &__name {
    font-size: 18px;
    color: red;
  }
  &__operating {
    text-align: center;
  }
}
</style>
