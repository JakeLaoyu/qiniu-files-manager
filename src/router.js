import IndexPage from './views/index.vue'

const routers = [{
  path: '/',
  component: IndexPage,
  meta: {
    title: ''
  },
  component: (resolve) => require(['./views/index.vue'], resolve)
}];
export default routers;
