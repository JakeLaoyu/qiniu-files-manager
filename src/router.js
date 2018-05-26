import IndexPage from '@views/imageList'
import BucketsManage from '@views/bucketsManage'

export default [
  {
    path: '/',
    name: '文件管理',
    component: IndexPage,
    meta: {
      title: 'qim-文件管理'
    }
  }, {
    path: '/buckets',
    name: 'Bucket管理',
    component: BucketsManage,
    meta: {
      keepAlive: true,
      title: 'qim-Bucket管理'
    }
  }
]
