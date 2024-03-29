import { plainToClassFromExist } from 'class-transformer'
import {
  ChatCompletionCreateParamsStreaming,
  ChatCompletionMessageParam
} from 'openai/resources/chat/completions'
import { Model } from './constants'
import { GetConversationByID } from '@/api/conversations'

interface IMessage {
  id: string
  parent: string
  role: 'system' | 'user' | 'assistant'
  content: string
  created_at?: number
}

interface IMappingItem {
  id: string
  parent: string
  children: string[]
  message: IMessage
}

export interface IConversationMeta {
  id: string
  title: string
  model: string
  max_tokens?: number
  temperature?: number
  current_node_id: string
  created_at?: number
  updated_at?: number
}

export interface IConversation {
  meta: IConversationMeta
  messages: {
    [key: string]: IMessage
  }
}

export class Conversation {
  meta: IConversationMeta
  mapping: Map<string, IMappingItem>
  scrollToBottom: Function | null = null
  resubmit: Function | null = null

  setResubmit(fn: Function) {
    this.resubmit = fn
  }
  clearResubmit() {
    this.resubmit = null
  }

  constructor() {
    this.meta = {
      id: '',
      title: 'New chat',
      model: Model.GPT35Turbo,
      current_node_id: ''
    }

    this.mapping = new Map<string, IMappingItem>()
  }
  init(id: string) {
    GetConversationByID(id).then((res) => {
      this.clear()
      for (const [messageId, message] of Object.entries(res.messages)) {
        this.mapping.set(messageId, {
          id: messageId,
          parent: message.parent,
          children: [],
          message: message
        })
      }
      this.mapping.set('', {
        id: '',
        parent: '',
        children: []
      } as unknown as IMappingItem)
      for (const [messageId, message] of Object.entries(res.messages)) {
        const parent = this.mapping.get(message.parent)
        if (parent) {
          let index = parent.children.length
          for (let i = 0; i < parent.children.length; i++) {
            const child = this.getMessage(parent.children[i])
            if ((message?.created_at ?? 0) < (child?.created_at ?? 0)) {
              index = i
              break
            }
          }
          parent.children.splice(index, 0, messageId)
        }
      }

      plainToClassFromExist(this.meta, res.meta)
      setTimeout(() => {
        if (this.scrollToBottom !== null) {
          this.scrollToBottom()
        }
      }, 100)
    })
  }

  clear() {
    this.meta.id = ''
    this.meta.title = 'New chat'
    // TODO: clear model settings
    this.meta.current_node_id = ''
    this.mapping.clear()
  }

  // Retrieve the array of message IDs from the root node to the specified leaf node
  getMessageIds(leafId: string): string[] {
    let result: string[] = []
    let curId = leafId
    while (
      curId !== '' &&
      this.mapping.has(curId) &&
      this.mapping.get(curId)?.message
    ) {
      const curMessage = this.mapping.get(curId) as IMappingItem
      result.unshift(curMessage.message.id)
      curId = curMessage.parent
    }
    return result
  }

  pushMessage(message: IMessage) {
    this.mapping.set(message.id, {
      id: message.id,
      parent: message.parent,
      children: [],
      message: message
    })
    if (!this.mapping.has(message.parent)) {
      this.mapping.set(message.parent, {
        id: message.parent,
        parent: '',
        children: [message.id],
        message: null as unknown as IMessage
      })
    } else {
      this.mapping.get(message.parent)?.children.push(message.id)
    }
    this.meta.current_node_id = message.id
  }

  toggleMessage(newId: string) {
    let stack = [newId]
    let leafId = newId
    while (stack.length > 0) {
      const cur = stack.pop() as string
      const children = this.mapping.get(cur)?.children ?? []
      for (let child of children) {
        if ((this.mapping.get(child)?.children ?? []).length === 0) {
          // TODO: 查找最近的叶子节点
          leafId = child
        } else {
          stack.push(child)
        }
      }
    }
    this.meta.current_node_id = leafId
  }
  getMessage(id: string): IMessage {
    return this.mapping.get(id)?.message as IMessage
  }
  getPeerIds(id: string): string[] {
    return this.mapping.get(this.getMessage(id).parent)?.children ?? []
  }
  buildCompletionsRequest(
    newMsg: Set<string>
  ): ChatCompletionCreateParamsStreaming {
    const messages: ChatCompletionMessageParam[] = []
    const historyIds = this.getMessageIds(this.meta.current_node_id)
    historyIds.forEach((id) => {
      const message = this.getMessage(id)
      if (newMsg.has(message.id)) {
        messages.push(message)
      } else {
        messages.push({
          role: message.role,
          content: message.content
        })
      }
    })
    return {
      id: this.meta.id,
      current_node_id: this.meta.current_node_id,
      model: this.meta.model,
      messages: messages,
      stream: true,
      save: true
    } as ChatCompletionCreateParamsStreaming
  }
  appendContent(content: string) {
    this.getMessage(this.meta.current_node_id).content += content
  }
}
