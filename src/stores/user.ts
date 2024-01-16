import { IUser } from '@/models/user'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    id: '',
    username: '',
    email: '',
    avatar: ''
  }),
  actions: {
    update(user: IUser) {
      this.id = user.id
      this.username = user.username
      this.email = user.email
      this.avatar = user.avatar
    }
  }
})
