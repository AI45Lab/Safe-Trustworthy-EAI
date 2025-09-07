// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { title: 'Trustworthy-Embodied-AI' } },
  { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') }
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL), // ← 改这里
  routes
})

router.afterEach((to) => {
  document.title = (to.meta && to.meta.title) || 'Trustworthy-Embodied-AI'
})

export default router
