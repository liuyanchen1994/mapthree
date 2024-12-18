import Vue from "vue";
import App from "./App.vue";
import router from "./route/router";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
Vue.use(ElementUI, {
  size: "medium",
  zIndex: 100
});
Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
