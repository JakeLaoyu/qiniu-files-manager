<template>
<div class="top">
  <Select :value="bucketName" style="width:150px" @on-change="changeBucket">
    <Option :value="item.bucket" v-for="item in buckets" :key="item.bucket" >{{ item.bucket }}</Option>
  </Select>

  <Button class="add-bucket" type="primary" @click="showModal=true">添加Bucket</Button>

  <Breadcrumb>
    <BreadcrumbItem v-for="item in openPrefixs" :key="item">{{item}}</BreadcrumbItem>
  </Breadcrumb>

  <span v-if="openPrefixs.length > 0">
    <span class="ivu-breadcrumb-item-separator">/</span>
  </span>

  <Tooltip slot="append" content="例如: image/jpg/" placement="right">
    <Input
      v-model="newPrefix"
      placeholder="添加前缀"
      style="width: 200px"
      @on-change="$emit('inputNewPrefix', newPrefix)"
      >
    </Input>
  </Tooltip>

  <div class="switch">
    <ButtonGroup v-if="multipleSwitch">
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
  mapMutations,
  mapActions
} from 'vuex'

import {
  ajax
} from '@util'

export default {
  data () {
    return {
      showModal: false,
      modalLoading: false,
      multipleSwitch: false,
      chooseAllSwitch: false,
      newPrefix: ''
    }
  },
  computed: {
    ...mapState([
      'openPrefixs',
      'buckets',
      'currentBucket',
      'imageList',
      'multipleSwitchFile'
    ]),
    bucketName () {
      return this.currentBucket.bucket || ''
    }
  },
  methods: {
    ...mapActions([
      'postSecrte'
    ]),
    ...mapMutations([
      'setBuckets',
      'setCurrentBucket',
      'emptyMultipleSwitchFile',
      'deleteImage',
      'changeMultipleSwitchFile',
      'chooseAllMultipleSwitchFile',
      'emptyOpenPrefixs'
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
    changeBucket (value) {
      var bucket = value
        ? this.buckets.find(item => {
          return item.bucket === value
        }) : this.buckets[0]
      this.emptyOpenPrefixs()
      this.setCurrentBucket(bucket)
      this.emptyMultipleSwitchFile()
      this.$emit('getList')
    },
    async addBucket (payload) {
      this.modalLoading = true
      this.setBuckets(payload)
      this.setCurrentBucket(payload)
      this.modalLoading = false
      this.showModal = false
      this.emptyMultipleSwitchFile()
      await this.postSecrte({
        accessKey: this.currentBucket.AccessKey,
        secretKey: this.currentBucket.SecretKey
      })
      this.$emit('getList')
    },
    closeModal () {
      this.showModal = false
    }
  },
  watch: {
    openPrefixs () {
      this.newPrefix = ''
      this.$emit('inputNewPrefix', this.newPrefix)
    }
  },
  mounted () {
    if (this.buckets.length === 0) {
      this.showModal = true
    }
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
