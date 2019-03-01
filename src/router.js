export default [
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
