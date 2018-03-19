import Vue from 'vue'
import App from './App'
import router from './router.js'
import store from './store'
import iView from 'iview'
import 'iview/dist/styles/iview.css'
import UiComponents from '@components'

Vue.config.productionTip = false

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
  ButtonGroup
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
