import { IUser } from '@/models/user'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    username: '',
    email: '',
    avatar: ''
  }),
  actions: {
    update(user: IUser) {
      this.username = user.username
      this.email = user.email
      this.avatar = user.avatar
    }
  }
})
