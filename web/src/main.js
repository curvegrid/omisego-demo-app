// Copyright (c) 2020 Curvegrid Inc.
import Vue from 'vue';
import Loading from 'vue-loading-overlay';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import cgutils from './plugins/cgutils';
import 'vue-loading-overlay/dist/vue-loading.css';

Vue.config.productionTip = false;

Vue.use(cgutils);
Vue.use(Loading);

new Vue({
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
