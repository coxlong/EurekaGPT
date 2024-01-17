import {
  GetConversations,
  StreamCompletions,
  UpdateConversationTitle
} from '@/api/conversations'
import { IConversationMeta, Conversation } from '@/models/conversations'
import { defineStore } from 'pinia'
import { useConfigStore } from '@/stores/config'

export const useConversationsStore = defineStore('conversations', {
  state: () => ({
    current: new Conversation(),
    history: [] as IConversationMeta[]
  }),
  actions: {
    updateHistory(genTitle: boolean) {
      GetConversations().then((res) => {
        this.history.length = 0
        this.history.push(...res)
        if (genTitle) {
          this.genTitle()
        }
      })
    },
    genTitle() {
      const req = this.current.buildCompletionsRequest() as any
      req.save = false
      req.model = 'gpt-3.5-turbo'
      req.messages.push({
        role: 'user',
        content:
          '使用四到五个字直接返回这句话的简要主题，不要解释、不要标点、不要语气词、不要多余文本，不要加粗，如果没有主题，请直接返回“新对话”'
      })

      const configStore = useConfigStore()
      StreamCompletions(configStore.gpt_3_api_key, req)
        .then(async (stream) => {
          for await (const chunk of stream) {
            chunk.choices[0]?.delta.content ?? ''
            this.history[0].title += chunk.choices[0]?.delta.content ?? ''
          }
          UpdateConversationTitle(this.current.meta.id, this.history[0].title)
        })
        .catch((e) => {
          snackbar.error(e?.error?.message ?? e)
        })
    }
  }
})
