import Vue from "vue";
import Router from "vue-router";
import threepage from './threePage'
import toolpage from './toolsPage'
import mtkpage from './mtkThreePage'
Vue.use(Router);


const routes = [
  {
    path: '/',
    redirect: '/home',
  }
]
routes.push(
{
  path: "/home",
  name: "home",
  component: () => import("../views/Home.vue")
})
// 纯three 例子
threepage.forEach(name => {
  routes.push({
      path: '/' + name,
      name: name,
      component: () => import(`../views/demo/three/${name}.vue`)
  })
})
//地图相关工具
toolpage.forEach(name => {
  routes.push({
      path: '/' + name,
      name: name,
      component: () => import(`../views/tools/${name}.vue`)
  })
})
mtkpage.forEach(name => {
  routes.push({
      path: '/' + name,
      name: name,
      component: () => import(`../views/demo/mtk.three/${name}.vue`)
  })
})
routes.push({
  path: '/testMap',
  name: "testMap",
  component: () => import(`../views/demo/mtk.common/testMap.vue`)
})
//襄阳大屏区划
routes.push({
  path: '/xyMap',
  name: "xyMap",
  component: () => import(`../views/demo/mtk.xiangyangScreen/testMap.vue`)
})

const router = new Router({
  // mode: "history",
  // base: process.env.BASE_URL,
  routes
});

export default router;
