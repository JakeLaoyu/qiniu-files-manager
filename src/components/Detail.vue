<template>
<div class="detail">
  <div class="detail__wrap" :style="detailStyle">
    <div class="detail__img">
      <Spin size="large" fix v-if="imgLoading"></Spin>
      <img :src="imageUrl" @load="imgLoad">
    </div>
    <div class="detail__info">
      <div class="detail__name">{{ detailImage.key.split('/')[detailImage.key.split('/').length - 1] }}</div>
      <div class="detail__url"><span>url:</span> {{ imageUrl }}</div>
      <div :class="`detail__${detailKey}`" v-for="detailKey in Object.keys(detailImage)" :key="detailKey"><span>{{detailKey}}:</span> {{ detailImage[detailKey] }}</div>

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

  <QimModal :isShow="showModal" title="移动或重命名" @ok="saveMove" :image="detailImage" type="move" :loading="modalLoading" @closeModal="closeModal" />
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
    detailImage: {
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
      return this.currentBucket.domain + this.detailImage.key
    }
  },
  watch: {
    detailImage () {
      this.imgLoading = true
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
      var filename = this.detailImage.key

      this.$Modal.confirm({
        title: '确认删除',
        content: '是否删除: ' + '<span style="color:red;">' + filename + '</span>',
        loading: true,
        onOk: async () => {
          let data = {
            key: this.detailImage.key,
            bucket: this.currentBucket.bucket
          }
          await ajax.post('/api/delImage', data)
          this.delLoading = false
          this.deleteImage(this.detailImage.key)
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
      if (moveTo === this.detailImage.key) {
        this.modalLoading = false
        this.showModal = false
        return
      }

      ajax.post('/api/moveImage', {
        bucket: this.currentBucket.bucket,
        key: this.detailImage.key,
        newKey: moveTo
      })

      this.modalLoading = false
      this.showModal = false

      location.reload()
    }
  },
  mounted () {
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
