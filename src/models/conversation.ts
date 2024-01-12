import {
  ChatCompletionCreateParamsStreaming,
  ChatCompletionMessageParam
} from 'openai/resources/chat/completions'
import { Model } from './constants'

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

interface IConversationMeta {
  id: string
  title: string
  model: string
  max_tokens?: number
  temperature?: number
  current_node_id: string
  created_at?: number
  updated_at?: number
}

export class Conversation {
  meta: IConversationMeta
  mapping: Map<string, IMappingItem>
  scrollToBottom: Function | null = null

  constructor() {
    this.meta = {
      id: '',
      title: 'New chat',
      model: Model.GPT35Turbo,
      current_node_id: ''
    }

    this.mapping = new Map<string, IMappingItem>()
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
    while (this.mapping.has(curId) && this.mapping.get(curId)?.message) {
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
    let leafId = ''
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
  buildCompletionsRequest(): ChatCompletionCreateParamsStreaming {
    const messages: ChatCompletionMessageParam[] = []
    const historyIds = this.getMessageIds(this.meta.current_node_id)
    historyIds.forEach((id) => {
      const message = this.getMessage(id)
      messages.push({
        role: message.role,
        content: message.content
      })
    })
    return {
      model: this.meta.model,
      messages: messages,
      stream: true
    }
  }
  appendContent(content: string) {
    this.getMessage(this.meta.current_node_id).content += content
  }
}
