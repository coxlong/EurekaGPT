import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { useSnackbarStore } from '@/stores/snackbar.ts'
import 'reflect-metadata'
import './style.css'
import App from './App.vue'
import 'virtual:svg-icons-register'
import { createVuetify } from 'vuetify'

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
