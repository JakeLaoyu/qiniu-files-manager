<template>
<div>
  <div>
    <Breadcrumb>
      <a href="javascript:void(0)"  @click="clickBreadcrumb(-1)">
        <BreadcrumbItem >首页</BreadcrumbItem>
      </a>
      <template v-for="(item, index) in openPrefixs">
        <a href="javascript:void(0)" :key="item" @click="clickBreadcrumb(index)">
          <BreadcrumbItem >{{item}}</BreadcrumbItem>
        </a>
      </template>
    </Breadcrumb>
  </div>

  <div class="top">
    <Select :value="bucketName" style="width:150px" @on-change="changeBucket">
      <Option :value="item.bucket" v-for="item in buckets" :key="item.bucket" >{{ item.bucket }}</Option>
    </Select>

    <Tooltip slot="append" content="例如: image/jpg/" placement="right" style="margin-right: 20px;">
      <Input
        v-model="newPrefix"
        placeholder="添加前缀"
        style="width: 200px"
        @on-change="$emit('inputNewPrefix', newPrefix)"
        >
      </Input>
    </Tooltip>

    <Input v-model="search" icon="search" placeholder="输入关键字过滤" clearable style="width: 200px" />

    <div class="switch">
      <ButtonGroup v-if="multipleSwitch" style="margin-right: 10px;">
        <Button type="primary" @click="moveModal=true">移动</Button>
        <Button type="error" @click="del">删除</Button>
      </ButtonGroup>

      <template v-if="multipleSwitch">
        <div class="switch__label">全选</div>
        <i-switch v-model="chooseAllSwitch" @on-change="chooseAll"></i-switch>
      </template>

      <Tag v-if="multipleSwitch" color="blue" style="margin: 0 10px;" @click.native="handleTag">{{ multipleSwitchFile.length }}</Tag>

      <div class="switch__label">多选：</div>
      <i-switch v-model="multipleSwitch" @on-change="$emit('switchChange',multipleSwitch)"></i-switch>
    </div>

    <QimModal :isShow="showModal" title="添加Bucket" @ok="addBucket" type="addBucket" :loading="modalLoading" @closeModal="closeModal" />
    <QimModal :isShow="moveModal" title="批量移动" @ok="saveMove" type="move" :loading="modalLoading" @closeModal="moveModal=false" />

    <SelectedModal :isShow="showSelectModal" :list="multipleSwitchFile" @close="showSelectModal=false"></SelectedModal>
  </div>
</div>
</template>
<script>
import SelectedModal from './SelectedModal.vue'
import {
  mapState,
  mapMutations,
  mapActions
} from 'vuex'

import { ajax, throttle } from '@util'

export default {
  props: ['filterFileList'],
  components: {
    SelectedModal
  },
  data () {
    return {
      showModal: false,
      modalLoading: false,
      multipleSwitch: false,
      chooseAllSwitch: false,
      showSelectModal: false,
      moveModal: false,
      newPrefix: '',
      search: '',
      throttleHandleSearch: throttle(this.hendleSearch, 500, 1000)
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
      'changeOpenPrefixs',
      'emptyMultipleSwitchFile',
      'deleteImage',
      'changeMultipleSwitchFile',
      'chooseAllMultipleSwitchFile'
    ]),
    hendleSearch () {
      this.$emit('handleSearch', this.search)
    },
    handleTag () {
      if (this.multipleSwitchFile.length === 0) return this.$Message.info('请先选择文件')
      this.showSelectModal = true
    },
    async saveMove (moveTo) {
      if (moveTo.charAt(0) !== '/') return this.$Message.error('请输入以 / 开头的绝对路径')
      moveTo = moveTo.charAt(moveTo.length - 1) === '/' ? moveTo : `${moveTo}/`
      this.modalLoading = true
      let data = {
        keys: this.multipleSwitchFile,
        bucket: this.currentBucket.bucket,
        newKey: moveTo
      }
      const { code } = await ajax.post('/api/multipleMoveImage', data)
      if (code === 1) {
        this.emptyMultipleSwitchFile()
        this.chooseAllSwitch = false
        this.modalLoading = false
        this.moveModal = false
      }
      this.$emit('getList')
    },
    clickBreadcrumb (index) {
      this.changeOpenPrefixs({
        type: 'jump',
        val: this.openPrefixs.slice(0, index + 1)
      })
      this.$emit('getList')
    },
    chooseAll () {
      this.chooseAllMultipleSwitchFile({
        status: this.chooseAllSwitch,
        fileList: this.filterFileList
      })
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
          this.chooseAllSwitch = false
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
      this.setCurrentBucket(bucket)
      this.emptyMultipleSwitchFile()
      this.chooseAllSwitch = false
      this.$emit('getList')
    },
    async addBucket (payload) {
      this.modalLoading = true
      this.setBuckets(payload)
      this.setCurrentBucket(payload[0])
      this.modalLoading = false
      this.showModal = false
      this.emptyMultipleSwitchFile()
      this.chooseAllSwitch = false
      await this.postSecrte({
        accessKey: this.currentBucket.AccessKey,
        secretKey: this.currentBucket.SecretKey
      })
      this.$emit('getList')
    },
    closeModal () {
      this.showModal = false
    },
    isSwitchAll () {
      let someone = this.filterFileList.some(item => !this.multipleSwitchFile.includes(item.key))
      if (someone) this.chooseAllSwitch = false
      if (!someone && this.filterFileList.length) this.chooseAllSwitch = true
    }
  },
  watch: {
    search (val) {
      this.throttleHandleSearch()
    },
    openPrefixs () {
      this.newPrefix = ''
      this.search = ''
      this.$emit('inputNewPrefix', this.newPrefix)
    },
    filterFileList (val) {
      this.isSwitchAll()
    },
    multipleSwitchFile (val) {
      this.isSwitchAll()
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
    user-select: none;
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
    padding: 10px 15px 0;
  }
}

.switch {
  float: right;
  height: 32px;
  line-height: 32px;
  &__label {
    display: inline-block;
  }
}
.add-bucket {
  float: left;
  margin-right: 20px;
}
</style>
