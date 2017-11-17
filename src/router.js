import IndexPage from './views/index.vue'
import BucketManage from './views/bucketManage.vue'

const routers = [{
  path: '/',
  component: IndexPage,
  meta: {
    title: ''
  },
  component: (resolve) => require(['./views/index.vue'], resolve)
}, {
  path: '/buckets',
  component: BucketManage,
  meta: {
    title: ''
  },
  component: (resolve) => require(['./views/bucketManage.vue'], resolve)
}];
export default routers;
