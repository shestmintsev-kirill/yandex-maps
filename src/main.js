import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import store from "./store";
import vuetify from "./plugins/vuetify";
import YmapPlugin from "vue-yandex-maps";
import apiKey from "./api/apiKey";

const ymapSettings = {
  //your api key
  apiKey: apiKey,
  lang: "ru_RU",
  coordorder: "latlong",
  version: "2.1",
};

Vue.use(YmapPlugin, ymapSettings);

Vue.config.productionTip = false;

new Vue({
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
