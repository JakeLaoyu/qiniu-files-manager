import Vue from 'vue'
import App from './app.vue'
import Router from 'vue-router'
import routerConfig from './router.js'
import store from './store'
import 'iview/dist/styles/iview.css'
import UiComponents from '@components'

Vue.config.productionTip = false

Vue.use(Router)

// 路由配置
const router = new Router({
  mode: 'history',
  routes: routerConfig,
})

router.beforeEach((to, from, next) => {
  if(to.meta.title) {
    document.title = to.meta.title
  }
  next()
})


import {
  Menu,
  Button,
  Row,
  Col,
  Modal,
  Input,
  Message,
  Notice,
  Upload,
  Icon,
  Spin,
  ButtonGroup,
  Breadcrumb,
  BreadcrumbItem,
  Select,
  Option,
  Layout,
  MenuItem
} from 'iview'

Vue.component('Menu', Menu)
Vue.component('Button', Button)
Vue.component('Modal', Modal)
Vue.component('Row', Row)
Vue.component('Col', Col)
Vue.component('Input', Input)
Vue.component('Upload', Upload)
Vue.component('Icon', Icon)
Vue.component('Spin', Spin)
Vue.component('ButtonGroup', ButtonGroup)
Vue.component('Breadcrumb', Breadcrumb)
Vue.component('BreadcrumbItem', BreadcrumbItem)
Vue.component('Select', Select)
Vue.component('Option', Option)
Vue.component('Layout', Layout)
Vue.component('MenuItem', MenuItem)
Vue.prototype.$Message = Message
Vue.prototype.$Notice = Notice
Vue.prototype.$Modal = Modal

Object.keys(UiComponents).forEach((key) => {
  Vue.component(key, UiComponents[ key ])
})

new Vue({
  el: '#app',
  router,
  store,
  components: {App},
  template: '<App/>'
})
