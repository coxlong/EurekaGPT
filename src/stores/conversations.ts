import { GetConversations } from '@/api/conversations'
import { IConversationMeta, Conversation } from '@/models/conversations'
import { defineStore } from 'pinia'

export const useConversationsStore = defineStore('conversations', {
  state: () => ({
    current: new Conversation(),
    history: [] as IConversationMeta[]
  }),
  actions: {
    updateHistory() {
      GetConversations().then((res) => {
        this.history.length = 0
        this.history.push(...res)
      })
    },
    setCurrent(id: string, updateRoute: boolean, updateData: boolean) {
      this.current.meta.id = id
      if (updateRoute) {
        window.history.pushState(null, '', `/c/${id}`)
      }
      if (updateData) {
        this.current.init(id)
      }
    }
  }
})
