import Vue from 'vue'
import Router from 'vue-router'

// 进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

Vue.use(Router)

// 路由配置
const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: '文件管理',
      component: () => import('@views/imageList'),
      meta: {
        keepAlive: true,
        title: 'qim-文件管理'
      }
    }, {
      path: '/buckets',
      name: 'Bucket管理',
      component: () => import('@views/bucketsManage'),
      meta: {
        keepAlive: true,
        title: 'qim-Bucket管理'
      }
    }, {
      path: '/search',
      name: '搜索',
      component: () => import('@views/search'),
      meta: {
        keepAlive: true,
        title: 'qim-搜索'
      }
    }
  ]
})

router.beforeEach((to, from, next) => {
  NProgress.start()
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
