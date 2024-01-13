import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import 'reflect-metadata'
import 'virtual:svg-icons-register'
import { createVuetify } from 'vuetify'
import './style.css'
import 'vuetify/styles'

import App from './App.vue'
import { useSnackbarStore } from '@/stores/snackbar.ts'
import { useConversationsStore } from '@/stores/conversations.ts'

const routes = [
  { name: 'home', path: '/', component: () => import('@/views/chat.vue') },
  { name: 'chat', path: '/c/:id', component: () => import('@/views/chat.vue') },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]
const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, _, next) => {
  if (to.name === 'chat') {
    const conversations = useConversationsStore()
    conversations.setCurrent(to.params.id as string, false, true)
  }
  next()
})

const pinia = createPinia()
const vuetify = createVuetify({})

const app = createApp(App)
app.use(router)
app.use(pinia)
app.use(vuetify)

const snackbarStore = useSnackbarStore()
window.snackbar = {
  error: (text: string) => {
    snackbarStore.show(text)
  }
}
app.mount('#app')
