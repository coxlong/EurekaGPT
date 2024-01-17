import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import 'reflect-metadata'
import 'virtual:svg-icons-register'
import { createVuetify } from 'vuetify'
import './style.css'
import 'vuetify/styles'

import App from './App.vue'
import { useUserStore } from '@/stores/user'
import { useSnackbarStore } from '@/stores/snackbar.ts'
import { useConversationsStore } from '@/stores/conversations.ts'
import { useConfigStore } from '@/stores/config.ts'
import { GetUser } from './api/auth'

const routes = [
  {
    name: 'login',
    path: '/login',
    component: () => import('@/views/login.vue')
  },
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
  const userStore = useUserStore()

  if (to.name === 'login') {
    if (userStore.id !== '') {
      next({ name: 'home' })
    } else {
      next()
    }
    return
  }

  if (userStore.id === '') {
    const userInfo = await GetUser().catch((_) => {
      next({ name: 'login' })
    })
    if (!userInfo) {
      snackbar.error('get user info failed')
      return
    }
    userStore.update(userInfo)
  }

  if (to.name === 'chat') {
    const conversations = useConversationsStore()
    const id = to.params.id as string
    conversations.current.init(id)
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

window.addEventListener('beforeunload', () => {
  const configStore = useConfigStore()
  localStorage.setItem('eureka_config', configStore.saveConfig())
})

window.addEventListener('load', () => {
  const configStore = useConfigStore()
  configStore.loadConfig(localStorage.getItem('eureka_config'))
})
