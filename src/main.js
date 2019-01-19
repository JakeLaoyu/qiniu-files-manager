import Vue from 'vue'
import App from './app.vue'
import Router from 'vue-router'
import routerConfig from './router.js'
import store from './store'
import '@/theme/custom.less'
import '@/theme/iconfont.js'
import UiComponents from '@components'
import VueLazyload from 'vue-lazyload'
import ErrorImg from '@/assets/file_error.png'
import * as Filter from '@/libs/filter'
import {
  Spin as ASpin
} from 'ant-design-vue'
// import 'ant-design-vue/dist/antd.css'
import 'ant-design-vue/lib/spin/style'

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
  MenuItem,
  Switch,
  Tooltip,
  Form,
  FormItem,
  Tag,
  Table
} from 'iview'

Vue.config.productionTip = false

Vue.use(VueLazyload, {
  error: ErrorImg,
  observer: true,
  observerOptions: {
    rootMargin: '0px',
    threshold: 0.1
  },
  adapter: {
    loaded ({ bindType, el, naturalHeight, naturalWidth, $parent, src, loading, error, Init }) {
      // 移出search loading动画
      var spin = el.parentNode.querySelector('.ivu-spin')
      if (spin) spin.parentNode.removeChild(spin)
    },
    error ({el}, Init) {
      // 移出search loading动画
      var spin = el.parentNode.querySelector('.ivu-spin')
      if (spin) spin.parentNode.removeChild(spin)
    }
  }
})
Vue.use(Router)

// 路由配置
const router = new Router({
  mode: 'history',
  routes: routerConfig
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

Vue.component('Menu', Menu)
Vue.component('Form', Form)
Vue.component('FormItem', FormItem)
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
Vue.component('Tooltip', Tooltip)
Vue.component('Tag', Tag)
Vue.component('Table', Table)
Vue.component('i-switch', Switch)
Vue.component('ASpin', ASpin)
Vue.prototype.$Message = Message
Vue.prototype.$Notice = Notice
Vue.prototype.$Modal = Modal

Object.keys(UiComponents).forEach((key) => {
  Vue.component(`Qim${key}`, UiComponents[ key ])
})
Object.keys(Filter).forEach((key) => {
  Vue.filter(`Filter${key}`, Filter[ key ])
})

/* eslint-disable */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
