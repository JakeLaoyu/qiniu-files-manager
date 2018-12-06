// import IndexPage from '@views/imageList'
// import BucketsManage from '@views/bucketsManage'
// import Search from '@views/search'

const IndexPage = () => import('@views/imageList')
const BucketsManage = () => import('@views/bucketsManage')
const Search = () => import('@views/search')

export default [
  {
    path: '/',
    name: '文件管理',
    component: IndexPage,
    meta: {
      keepAlive: true,
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
  }, {
    path: '/search',
    name: '搜索',
    component: Search,
    meta: {
      keepAlive: true,
      title: 'qim-搜索'
    }
  }
]
