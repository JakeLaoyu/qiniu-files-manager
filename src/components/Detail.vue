<template>
<div class="detail">
  <div class="detail__wrap" :style="detailStyle">
    <div class="detail__img">
      <Spin size="large" fix v-if="imgLoading"></Spin>
      <img :src="imageUrl" @load="imgLoad" v-if="detailFile.mimeType.split('/')[0]==='image'">
      <QimIcon
        v-else
        :icon="detailFile.mimeType.split('/')[detailFile.mimeType.split('/').length-1]"
        size="80"
        />
    </div>
    <div class="detail__info">
      <div class="detail__name">{{ detailFile.key.split('/')[detailFile.key.split('/').length - 1] }}</div>
      <div class="detail__url"><span>url:</span> {{ imageUrl }}</div>
      <div :class="`detail__${detailKey}`" v-for="detailKey in Object.keys(detailFile)" :key="detailKey"><span>{{detailKey}}:</span> {{ detailFile[detailKey] }}</div>

      <div class="detail__operating">
        <ButtonGroup>
          <Button type="ghost" :loading="delLoading" @click="delImage">
            <span v-if="!delLoading">删除</span>
            <span v-else>Loading...</span>
          </Button>
          <Button type="ghost" @click="moveImage">移动或者重命名</Button>
        </ButtonGroup>

        <div style="margin-top:20px;">
          <a :href="imageUrl" download><Button type="ghost" icon="ios-cloud-download-outline"></Button></a>
          <a :href="imageUrl" target="_blank"><Button type="ghost" icon="eye">打开</Button></a>
          <Button type="primary" id="copyBtn" icon="ios-copy">复制链接</Button>
        </div>
      </div>
    </div>

  </div>

  <QimModal :isShow="showModal" title="移动或重命名" @ok="saveMove" :image="detailFile" type="move" :loading="modalLoading" @closeModal="closeModal" />
</div>
</template>
<script>
import {
  mapState,
  mapMutations
} from 'vuex'

import {
  ajax
} from '@util'

import Clipboard from 'clipboard'

export default {
  props: {
    detailFile: {
      type: Object
    },
    detailStyle: {
      type: Object
    }
  },
  data () {
    return {
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
    imageUrl () {
      return this.currentBucket.domain + this.detailFile.key
    }
  },
  watch: {
    detailFile (val, oldVal) {
      if (this.detailFile.mimeType.split('/')[0] === 'image' && val.key !== oldVal.key) {
        this.imgLoading = true
      }
    }
  },
  methods: {
    ...mapMutations([
      'deleteImage'
    ]),
    imgLoad () {
      this.imgLoading = false
      this.$emit('imageload')
    },
    closeModal () {
      this.showModal = false
    },
    delImage () {
      this.delLoading = true
      var filename = this.detailFile.key

      this.$Modal.confirm({
        title: '确认删除',
        content: '是否删除: ' + '<span style="color:red;">' + filename + '</span>',
        loading: true,
        onOk: async () => {
          let data = {
            key: this.detailFile.key,
            bucket: this.currentBucket.bucket
          }
          await ajax.post('/api/delImage', data)
          this.delLoading = false
          this.deleteImage(this.detailFile.key)
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
      if (moveTo === this.detailFile.key) {
        this.modalLoading = false
        this.showModal = false
        return
      }

      ajax.post('/api/moveImage', {
        bucket: this.currentBucket.bucket,
        key: this.detailFile.key,
        newKey: moveTo
      })

      this.modalLoading = false
      this.showModal = false

      location.reload()
    }
  },
  mounted () {
    if (this.detailFile.mimeType.split('/')[0] !== 'image') {
      this.imgLoading = false
    }
    let clipboard = new Clipboard('#copyBtn', {
      text: () => this.imageUrl
    })
    clipboard.on('success', e => {
      this.$Message.success('复制成功 ' + this.imageUrl)
    })
  }
}
</script>
<style lang="less" scoped>
.detail {
  background: #fff;
  font-size: 14px;
  color: #666;
  position: relative;
  padding: 10px;
  box-sizing: border-box;
  min-height: 100px;
  transition: top 0.5s;
  top: 0;
  &__wrap{
    overflow-y: scroll;
  }
  & > div {
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
