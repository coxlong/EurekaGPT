import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    username: 'hello'
  }),
  actions: {
    updateUsername(username: string) {
      this.username = username
    }
  }
})
