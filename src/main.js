import Vue from 'vue'
import App from './App'
import router from './router'
import 'common/stylus/index.styl'
import VueLazyload from 'vue-lazyload'
import store from './store'
Vue.config.productionTip = false

/* eslint-disable no-new */
Vue.use(VueLazyload, {
  loading: require('common/image/default.png')
})
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
