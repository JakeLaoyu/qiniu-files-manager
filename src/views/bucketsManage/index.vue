<template>
<div class="buckets">
  <Header>
    <Menu ref="menu" mode="horizontal" theme="light" :active-name="1" @on-select="changeMenu">
      <MenuItem v-for="(item, index) in buckets" :key="index" :name="index + 1">
        <Icon type="social-dropbox"></Icon>
        {{ item.bucket }}
      </MenuItem>
      <Button class="add-bucket" type="primary" @click="showModal=true">添加</Button>
      <Button class="add-bucket" type="error" @click="handleEmpty">清空</Button>
    </Menu>
  </Header>
  <div :style="{background: '#fff', paddingBottom: '30px'}">
    <div class="form">
      <Form ref="bucket" :model="bucket">
        <FormItem :label="key" :prop="key" v-for="(key,index) in Object.keys(bucket)" :key="index" >
          <Input v-if="typeof bucket[key] === 'string'" v-model="bucket[key]" disabled :placeholder="key" style="width: 100%"></Input>
          <Select v-if="key==='domains'" v-model="bucket['domain']" @on-open-change="submit">
            <Option v-for="d in bucket[key]" :value="d" :key="d">{{ d }}</Option>
          </Select>
          <Select v-if="key==='isPrivate'" v-model="bucket['isPrivate']" @on-open-change="submit">
            <Option :value="0" >否</Option>
            <Option :value="1" >是</Option>
          </Select>
        </FormItem>

        <FormItem class="btns" v-if="this.bucket.bucket">
          <Button type="error" size="large" long @click="delModal=true">删除</Button>
        </FormItem>
      </Form>
    </div>
  </div>

  <Modal v-model="delModal" width="360">
    <p slot="header" style="color:#f60;text-align:center">
      <Icon type="information-circled"></Icon>
      <span>删除确认</span>
    </p>
    <div style="text-align:center">
      <p>是否继续删除 {{ bucket.bucket }}？</p>
    </div>
    <div slot="footer">
      <Button type="error" size="large" long @click="del">删除</Button>
    </div>
  </Modal>

  <QimModal :isShow="showModal" title="添加Bucket" @ok="addBucket" type="addBucket" :loading="modalLoading" @closeModal="showModal = false" />
</div>
</template>
<script>
import {
  mapState,
  mapMutations,
  mapActions
} from 'vuex'

export default {
  data () {
    return {
      bucket: {},
      showModal: false,
      modalLoading: false,
      delModal: false
    }
  },
  computed: {
    ...mapState([
      'buckets',
      'currentBucket'
    ])
  },
  methods: {
    ...mapActions([
      'postSecrte',
      'getList'
    ]),
    ...mapMutations([
      'delBucket',
      'changeBucket',
      'setBuckets',
      'setCurrentBucket',
      'emptyMultipleSwitchFile',
      'emptyState'
    ]),
    handleEmpty () {
      this.$Modal.confirm({
        title: '确认',
        content: '是否清空',
        okText: '取消',
        cancelText: '确认',
        onOk: () => {},
        onCancel: () => {
          this.emptyState()
          this.bucket = {}
          this.$Message.success('清除成功')
          this.showModal = true
        }
      })
    },
    async addBucket (payload) {
      this.modalLoading = true
      this.setBuckets(payload)
      this.setCurrentBucket(payload[0])
      this.modalLoading = false
      this.showModal = false
      this.emptyMultipleSwitchFile()
      await this.postSecrte({
        accessKey: this.currentBucket.AccessKey,
        secretKey: this.currentBucket.SecretKey
      })
      this.getList({})
    },
    submit (val) {
      if (val) return
      this.changeBucket(this.bucket)
      this.$Message.success('保存成功')
    },
    del () {
      this.delBucket(this.bucket)
      this.delModal = false
      this.bucket = {}
      this.$Message.success('删除成功')
      if (!this.buckets.length) this.showModal = true
    },
    changeMenu (name) {
      this.bucket = this.buckets[name - 1]
    }
  },
  mounted () {
    if (this.buckets.length === 0) return this.$router.push('/')
    this.bucket = this.buckets[0]
  },
  activated () {
    if (this.buckets.length === 0) return this.$router.push('/')
  }
}
</script>
<style lang="less" scoped>
.buckets {
  margin-top: 5px;
}
.layout-nav {
    width: 420px;
    margin: 0 20px 0 auto;
}
.layout-footer-center {
    text-align: center;
}
.ivu-menu {
    text-align: center;
    &-item {
        display: inline-block;
        float: none!important;
        user-select: none;
    }
}
.form {
    width: 500px;
    margin: 0 auto;
    padding-top: 20px;
}
.btns {
  text-align: center;
}
</style>
