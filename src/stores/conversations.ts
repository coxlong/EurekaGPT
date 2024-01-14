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
    }
  }
})
