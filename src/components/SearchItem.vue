<template>
<div class="item">
  <Spin size="large" fix v-if="imgLoading"></Spin>
  <img v-lazy="`${domain}${item.key}?imageView2/1/w/275/h/275`" @load="imgLoad" v-if="item.mimeType.indexOf('image')!=-1">
  <div class="item__file" v-else>
    <QimIcon :icon="item.mimeType.split('/')[item.mimeType.split('/').length-1]"></QimIcon>
    <Icon item.mimeType="checkmark-circled" size="14" color="#007AFA"></Icon>
  </div>
  <div class="item__btn">
    <a href="javascript: void(0)" @click="$emit('preview',item)">预览</a>
    <a href="javascript: void(0)" @click="$emit('itemDetail',item)">信息</a>
    <a href="javascript: void(0)" :id="`copyBtn${index}`">复制地址</a>
    <a href="javascript: void(0)" @click="delImage">删除</a>
  </div>
</div>
</template>
<script>
import Clipboard from 'clipboard'
import {
  mapState,
  mapMutations
} from 'vuex'
import {
  ajax
} from '@util'
export default {
  props: ['item', 'index', 'domain'],
  data () {
    return {
      delLoading: false,
      imgLoading: true
    }
  },
  computed: {
    ...mapState([
      'currentBucket'
    ])
  },
  methods: {
    ...mapMutations([
      'deleteImage'
    ]),
    imgLoad () {
      this.imgLoading = false
    },
    copyUrl () {
      if (this.clipboard) {
        this.clipboard.destroy()
      }
      this.clipboard = new Clipboard(`#copyBtn${this.index}`, {
        text: () => `${this.domain}${this.item.key}`
      })
      this.clipboard.on('success', e => {
        this.$Message.success(`复制成功 ${this.domain}${this.item.key}`)
      })
    },
    delImage () {
      this.delLoading = true
      var filename = this.item.key

      this.$Modal.confirm({
        title: '确认删除',
        content: '是否删除: ' + '<span style="color:red;">' + filename + '</span>',
        loading: true,
        onOk: async () => {
          let data = {
            key: this.item.key,
            bucket: this.currentBucket.bucket
          }
          await ajax.post('/api/delImage', data)
          this.delLoading = false
          this.$emit('delItem', this.item.key)
          this.deleteImage(this.item.key)
          this.$Message.success('删除成功')
          this.$Modal.remove()
        },
        onCancel: () => {
          this.delLoading = false
        }
      })
    }
  },
  mounted () {
    this.copyUrl()
  },
  updated () {
    this.copyUrl()
  },
  activated () {
    this.copyUrl()
  }
}
</script>
<style lang="less" scoped>
.item {
  height: 100%;
  position: relative;
  overflow: hidden;
  &:hover {
    .item__btn {
      bottom: 0;
    }
  }
  img{
    max-width: 100%;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
  }
  &__file {
    width: 100%;
    height: 100%;
    font-size: 0;
    position: relative;
    .icon {
      height: 100%;
      width: 100%;
    }
  }
  &__btn {
    position: absolute;
    bottom: -41px;
    left: 0;
    right: 0;
    padding: 10px;
    background: rgba(0,0,0,.7);
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all .2s;
    a {
      display: inline-block;
      color: #fff;
      &:hover {
        color: darken(#fff, 20%);
      }
    }
  }
}
</style>
