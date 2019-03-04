<template>
<div v-if="type=='image'" class="item">
  <div class="item__image" :class={active:choosed} @click="$emit('clickFile',item)">
    <Spin size="small" fix></Spin>
    <img v-if="!isPrivate" v-lazy="`${domain}${item.key}?imageView2/1/w/113/h/113`" alt="">
    <img v-else v-lazy="`${domain}${item.key}?${item.private}`" alt="">
    <Icon type="checkmark-circled" size="14" color="#007AFA"></Icon>
  </div>
</div>
<div v-else-if="type=='folder'" class="item">
  <div class="item__folder" @click="$emit('clickPrefix',item)">
    <QimIcon icon="folder" :size="60" color="#FFD667" />
    <div class="item__folder-name">{{ item }}</div>
  </div>
</div>
<div v-else-if="type=='return'" class="item">
  <div class="item__folder" @click="$emit('returnDirectory')">
    <QimIcon icon="24" :size="60" />
    <div class="item__folder-name">返回上一级</div>
  </div>
</div>
<div v-else-if="type=='empty'" class="item">
  <div class="item__folder">
    <div class="item__folder-name">无文件</div>
  </div>
</div>
<div v-else class="item">
  <div class="item__file" :class={active:choosed} @click="$emit('clickFile',item)">
    <QimIcon :icon="type.split('/')[type.split('/').length-1]"></QimIcon>
    <div class="file-name">{{ item.key.split('/')[item.key.split('/').length-1] }}</div>
    <Icon type="checkmark-circled" size="14" color="#007AFA"></Icon>
  </div>
</div>
</template>
<script>
import folderImg from '@assets/folder.png'
import returnImg from '@assets/return.png'

import {
  mapState
} from 'vuex'

export default {
  props: {
    type: {
      type: String
    },
    item: {
      type: [Object, String]
    },
    domain: {
      type: String
    },
    choosed: {
      type: Boolean,
      default: false
    },
    isPrivate: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      folderImg,
      returnImg
    }
  },
  computed: {
    ...mapState([
      'openPrefixs'
    ])
  }
}
</script>
<style lang="less" scoped>
.item {
    display: inline-block;
    text-align: center;
    overflow: hidden;
    cursor: pointer;
    width: 130px;
    height: 100px;
    margin-bottom: 10px;
    border-radius: 5px;
    background: #fff;
    &:hover {
        background: #DEDEDE;
    }
    img {
        max-width: 100%;
        max-height: 100%;
    }
    &:after {
        content: '';
        display: inline-block;
        vertical-align: middle;
        height: 100%;
    }
    &.disable {
        cursor: default;
        &:hover {
            background: #fff;
        }
        .folder {
            cursor: default;
        }
    }

    &__folder {
        width: 99%;
        display: inline-block;
        vertical-align: middle;
        cursor: pointer;
        &-name {
            font-size: 12px;
            height: 15px;
            line-height: 15px;
            padding: 0 5px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
    &__image,
    &__file {
        width: 100%;
        height: 100%;
        font-size: 0;
        position: relative;
        & > img {
            vertical-align: middle;
        }
        &.active {
            .ivu-icon {
                display: block;
            }
        }
        .ivu-icon {
            display: none;
            position: absolute;
            right: 5%;
            bottom: 5%;
        }
    }
    &__file{
      display: inline-block;
      vertical-align: middle;
      word-wrap: break-word;
      width: 100%;
      height: auto;
    }
}
.file-name{
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 5px;
  margin-top: 10px;
}
</style>
