<template>
<div class="top">
  <Select v-model="bucketName" style="width:150px" @on-change="changeBucket">
    <Option :value="item.bucket" v-for="item in buckets" :key="item.bucket" >{{ item.bucket }}</Option>
  </Select>

  <Button class="add-bucket" type="primary" @click="showModal=true">添加Bucket</Button>
  <Button class="add-bucket" type="warning">新建文件夹</Button>

  <Breadcrumb>
    <BreadcrumbItem v-for="item in openPrefixs" :key="item">{{item}}</BreadcrumbItem>
  </Breadcrumb>

  <!-- div.multiple -->

  <div class="switch">
    <ButtonGroup v-if="multipleSwitch">
      <!-- <Button>批量移动或重命名</Button>
                <Button>批量复制</Button> -->
      <Button type="error" @click="del">批量删除</Button>
    </ButtonGroup>

    <template v-if="multipleSwitch">
                <div class="switch__label">全选</div>
                <i-switch v-model="chooseAllSwitch" @on-change="chooseAll"></i-switch>
            </template>

    <div class="switch__label">多选：</div>
    <i-switch v-model="multipleSwitch" @on-change="$emit('switchChange',multipleSwitch)"></i-switch>
  </div>

  <QimModal :isShow="showModal" title="添加Bucket" @ok="addBucket" type="addBucket" :loading="modalLoading" @closeModal="closeModal" />
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

export default {
  data () {
    return {
      showModal: false,
      modalLoading: false,
      bucketName: '',
      multipleSwitch: false,
      chooseAllSwitch: false
    }
  },
  computed: {
    ...mapState([
      'openPrefixs',
      'buckets',
      'currentBucket',
      'buckets',
      'imageList',
      'multipleSwitchFile'
    ])
  },
  methods: {
    ...mapMutations([
      'setBuckets',
      'setCurrentBucket',
      'emptyMultipleSwitchFile',
      'deleteImage',
      'changeMultipleSwitchFile',
      'chooseAllMultipleSwitchFile'
    ]),
    chooseAll () {
      this.chooseAllMultipleSwitchFile(this.chooseAllSwitch)
    },
    del () {
      this.$Modal.confirm({
        title: '确认删除',
        content: '是否删除多个文件',
        loading: true,
        onOk: async () => {
          let data = {
            key: this.multipleSwitchFile,
            bucket: this.currentBucket.bucket
          }
          await ajax.post('/api/delImage', data)
          this.multipleSwitchFile.forEach(item => {
            this.deleteImage(item)
          })
          this.$Message.success('删除成功')
          this.emptyMultipleSwitchFile()
          this.$Modal.remove()
          this.$emit('deleteImage')
        },
        onCancel: () => {
          this.delLoading = false
        }
      })
    },
    changeBucket () {
      var bucket = this.bucketName
        ? this.buckets.find(item => {
          return item.bucket === this.bucketName
        }) : this.buckets[0]
      this.setCurrentBucket(bucket)
      this.emptyMultipleSwitchFile()
      this.$emit('getList')
    },
    addBucket (payload) {
      this.modalLoading = true
      this.setBuckets(payload)
      this.setCurrentBucket(payload)
      this.modalLoading = false
      this.showModal = false
      this.emptyMultipleSwitchFile()
      this.$emit('getList')
    },
    closeModal () {
      this.showModal = false
    }
  },
  watch: {
    currentBucket (val, oldVal) {
      this.bucketName = this.currentBucket ? this.currentBucket.bucket : ''
    }
  },
  mounted () {
    if (this.buckets.length === 0) {
      this.showModal = true
    }
    this.bucketName = this.currentBucket ? this.currentBucket.bucket : ''
  }
}
</script>
<style lang="less" scoped>
.top {
    width: 1200px;
    margin: 0 auto;
    padding: 10px 15px 0;
    &:after {
        content: '';
        display: block;
        clear: both;
    }
}

.ivu {
  &-select {
    float: left;
    margin-right: 20px;
  }
  &-breadcrumb {
    float: left;
    line-height: 32px;
  }
}

.switch {
  float: right;
  height: 32px;
  line-height: 32px;
  &__label {
    display: inline-block;
    margin-left: 20px;
  }
}
.add-bucket {
  float: left;
  margin-right: 20px;
}
</style>
