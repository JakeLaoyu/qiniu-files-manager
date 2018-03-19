import Vue from 'vue'
import Router from 'vue-router'
import IndexPage from '@views/imageList'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: '图片管理',
      component: IndexPage
    }
  ]
})
