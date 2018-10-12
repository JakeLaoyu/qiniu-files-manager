<template>
<div v-if="type=='image'">
  <Col span="4" class-name="item">
    <div class="item__image" :class={active:choosed} @click="$emit('clickFile',item)">
      <Spin size="small" fix></Spin>
      <img v-if="!isPrivate" v-lazy="`${domain}${item.key}?imageView2/1/w/113/h/113`" alt="">
      <img v-else v-lazy="`${domain}${item.key}?${item.private}`" alt="">
      <Icon type="checkmark-circled" size="14" color="#007AFA"></Icon>
    </div>
  </Col>
</div>
<div v-else-if="type=='folder'">
  <Col span="4" class-name="item" >
    <div class="item__folder" @click="$emit('clickPrefix',item)">
      <img :src="folderImg" alt="">
      <div class="folder-name">{{ item }}</div>
    </div>
  </Col>
</div>
<div v-else-if="type=='return'">
  <Col span="4" class-name="item" >
    <div class="item__folder" @click="$emit('returnDirectory')">
      <img :src="returnImg" alt="">
      <div class="folder-name">返回上一级</div>
    </div>
  </Col>
</div>
<div v-else-if="type=='empty'">
  <Col span="4" class-name="item" >
    <div class="item__folder">
      <div class="folder-name">无文件</div>
    </div>
  </Col>
</div>
<div v-else>
  <Col span="4" class-name="item" >
    <div class="item__file" :class={active:choosed} @click="$emit('clickFile',item)">
      <QimIcon :icon="type.split('/')[type.split('/').length-1]"></QimIcon>
      <div class="file-name">{{ item.key.split('/')[item.key.split('/').length-1] }}</div>
      <Icon type="checkmark-circled" size="14" color="#007AFA"></Icon>
    </div>
  </Col>
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
    text-align: center;
    overflow: hidden;
    cursor: pointer;
    height: 113px;
    margin-bottom: 20px;
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
        img {
            width: 50%;
            margin-bottom: 10%;
        }
        &-name {
            font-size: 16px;
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
  font-size: 14px;
}
</style>
