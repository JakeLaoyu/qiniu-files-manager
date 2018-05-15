<template>
<div id="app" class="layout">
    <Menu mode="horizontal" theme="light" active-name="1">
        <router-link class="layout-logo" to="/">七牛文件管理</router-link>
        <a class="layout-logo" href="https://github.com/JakeLaoyu/qiniu-images-manager" target="_blank">GitHub</a>

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
export default {
  name: 'App'
}
</script>

<style lang="less" scoped>
.layout {
  border: 1px solid #d7dde4;
  background: #f5f7f9;
  border-bottom: 0;
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
