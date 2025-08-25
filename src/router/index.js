import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'Trustworthy-Embodied-AI' } // ← 新增：首页标题
  },
  {
    path: '/about',
    name: 'about',
    // 仍然保留你的懒加载写法
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue'),
    //meta: { title: 'About - Trustworthy-Embodied-AI' } // ← 新增：About 页标题
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.afterEach((to) => {
  document.title = (to.meta && to.meta.title) || 'Trustworthy-Embodied-AI'
})
export default router
