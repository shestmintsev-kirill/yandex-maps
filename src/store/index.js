import Vue from "vue";
import Vuex from "vuex";
import ymap from "./modules/ymap";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  getters: {},
  mutations: {},
  actions: {},
  modules: {
    ymap,
  },
});
