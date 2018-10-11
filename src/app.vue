<template>
<div id="app" class="layout">
    <Row class="menu__wrap">
      <Col span="12">
        <router-link class="layout-logo" to="/">
          <img class="logo" :src="Logo">
          <span>QIM</span>
        </router-link>
      </Col>

      <Col span="12" class="menu__right">
        <Menu mode="horizontal" :active-name="activeName" @on-select="menuSelect">
          <MenuItem :name="1">文件管理</MenuItem>
          <MenuItem :name="2">空间管理</MenuItem>
          <MenuItem :name="3">搜索</MenuItem>

          <ButtonGroup style="margin-left: 10px;">
            <a class="layout-logo" href="https://github.com/JakeLaoyu/qiniu-files-manager" target="_blank">
              <Button size="small">
                <Icon type="social-github"></Icon>
              </Button>
            </a>
          </ButtonGroup>
        </Menu>
      </Col>
    </Row>

    <keep-alive>
        <router-view v-if="$route.meta.keepAlive"/>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>
</div>
</template>

<script>

import { mapState, mapMutations } from 'vuex'
import Logo from '@/assets/logo.png'

export default {
  name: 'App',
  data () {
    return {
      Logo,
      activeName: 1
    }
  },
  computed: {
    ...mapState([
      'currentBucket'
    ])
  },
  methods: {
    ...mapMutations([
      'emptyState'
    ]),
    menuSelect (name) {
      if (name === 1) this.$router.push('/')
      if (name === 2) this.$router.push('/buckets')
      if (name === 3) this.$router.push('/search')
    }
  },
  mounted () {
    const { path } = this.$route
    if (path === '/') this.activeName = 1
    if (path === '/buckets') this.activeName = 2
    if (path === '/search') this.activeName = 3
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
  height: 60px;
  line-height: 60px;
  font-size: 0;
  img {
    height: 100%;
    vertical-align: middle;
    margin-right: 10px;
  }
  span {
    font-size: 24px;
    vertical-align: middle;
  }
}
.menu {
  &__wrap {
    background: #fff;
    box-shadow: 0 1px 1px rgba(0,0,0,.08);
    padding: 0 30px;
  }
  &__right {
    text-align: right;
    .ivu-menu {
      font-size: 0;
      &:after {
        display: none;
      }
    }
    .ivu-menu-item {
      float: none;
      display: inline-block;
      vertical-align: middle;
    }
  }
}
</style>

<style>
body{
  font-size: 14px;
}
</style>
