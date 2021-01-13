import { createApp } from 'vue'
import App from './App.vue'
import Golf from './routes/golf.vue'
import './index.css'
import { createRouter, createWebHistory } from 'vue-router'

import 'hack'
import 'hack/dist/dark.css'

const routes = [
  { path: '/admin', component: () => import('./routes/admin.vue') },
  { path: '/', component: Golf },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

createApp(App).use(router).mount('#app')
