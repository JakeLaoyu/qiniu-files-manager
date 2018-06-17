<template>
<div class="buckets">
  <Layout>
    <Header :style="{position: 'fixed', width: '100%'}">
      <Menu mode="horizontal" theme="light" :active-name="1" @on-select="changeMenu">
        <MenuItem v-for="(item, index) in buckets" :key="index" :name="index+1">
          <Icon type="briefcase"></Icon>
          {{ item.bucket }}
        </MenuItem>
      </Menu>
    </Header>
    <Content :style="{margin: '88px 20px 0', background: '#fff', paddingBottom: '30px'}">
      <div class="form">
        <div class="form__item" v-for="(key,index) in Object.keys(bucket)" :key="index">
          <div class="form__label">{{ key }}</div>
          <Input v-model="bucket[key]" :placeholder="key" style="width: 100%"></Input>
        </div>
      </div>

      <div class="btns" v-if="bucket && bucket.bucket">
        <Button type="primary" size="large" @click="submit">提交</Button>
        <Button type="error" size="large" @click="delModal=true">删除</Button>
      </div>

    </Content>
  </Layout>

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
</div>
</template>
<script>
import {
  mapState,
  mapMutations
} from 'vuex'

export default {
  data () {
    return {
      bucket: {},
      delModal: false
    }
  },
  computed: {
    ...mapState([
      'buckets'
    ])
  },
  methods: {
    ...mapMutations([
      'delBucket',
      'changeBucket'
    ]),
    submit () {
      this.changeBucket(this.bucket)
      this.$Message.success('提交成功')
    },
    del () {
      this.delBucket(this.bucket)
      this.delModal = false
      this.bucket = {}
      this.$Message.success('删除成功')
    },
    changeMenu (name) {
      this.bucket = this.buckets[name - 1]
    }
  },
  mounted () {
    this.bucket = this.buckets[0]
  }
}
</script>
<style lang="less" scoped>
.layout-logo {
    width: 100px;
    height: 30px;
    background: #5b6270;
    border-radius: 3px;
    float: left;
    position: relative;
    top: 15px;
    left: 20px;
}
.layout-nav {
    width: 420px;
    margin: 0 20px 0 auto;
}
.layout-footer-center {
    text-align: center;
}
.ivu-layout {
  height: calc(~"100vh - 30px");
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
    &__item {
        margin-bottom: 20px;
    }
    &__label {
        padding: 0 0 10px;
        font-size: 12px;
        color: #495060;
        line-height: 1;
        box-sizing: border-box;
    }
}
.btns {
    text-align: center;
    button:first-child {
        margin-right: 100px;
    }
}
</style>
