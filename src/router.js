import IndexPage from '@views/imageList'
import BucketsManage from '@views/bucketsManage'

export default [
  {
    path: '/',
    name: '图片管理',
    component: IndexPage,
    meta: {
      title: 'qim-图片管理'
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
