<template>
<div id="app" class="layout">
    <Menu mode="horizontal" theme="light" active-name="1">
        <router-link class="layout-logo" to="/">七牛文件管理</router-link>
        <a class="layout-logo" href="https://github.com/JakeLaoyu/qiniu-files-manager" target="_blank">GitHub</a>

        <router-link class="routerlink" to="/search">
          <Icon type="search"></Icon>
        </router-link>
        <router-link class="routerlink" to="/buckets">Bucket</router-link>
        <router-link class="routerlink" to="/">File</router-link>
    </Menu>

    <keep-alive>
        <router-view v-if="$route.meta.keepAlive"/>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>
</div>
</template>

<script>

import { mapState, mapMutations } from 'vuex'

export default {
  name: 'App',
  computed: {
    ...mapState([
      'currentBucket'
    ])
  },
  methods: {
    ...mapMutations([
      'emptyState'
    ])
  },
  created () {
    // 更新为 通过 ak、sk获取数据后，需要重新拉数据
    if (this.currentBucket.domain && !this.currentBucket.domains) {
      this.$Notice.open({
        title: '通知',
        desc: '新版更细，需要设置AccessKey、SecretKey',
        duration: 3
      })
      this.emptyState()
    }
  }
}
</script>

<style lang="less" scoped>
.layout {
  background: #f5f7f9;
  border-bottom: 0;
  min-width: 1200px;
}
.layout-logo {
  padding: 0 10px;
  border-radius: 3px;
  float: left;
}
.routerlink{
  float: right;
  margin-right: 20px;
}
.ivu {
  &-menu {
    &-horizontal {
      height: 30px;
      line-height: 30px;
    }
  }
}
</style>

<style>
body{
  font-size: 14px;
}
</style>
