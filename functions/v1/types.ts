/*eslint no-undef: "off"*/
import { ChatCompletionCreateParamsBase } from 'openai/resources/chat/completions'

export interface Env {
  EurekaKV: KVNamespace
  OPENAI_API_BASE: string
  DEVELOP: string
}

export interface IMessage {
  id?: string
  parent?: string
  role: 'system' | 'user' | 'assistant'
  content: string
  created_at?: number
}
export interface ChatCompletionRequestParams
  extends ChatCompletionCreateParamsBase {
  id: string
  messages: IMessage[]
}

export interface IConversationMeta {
  id: string
  title?: string
  model?: string
  max_tokens?: number
  temperature?: number
  current_node_id: string
  created_at?: number
  updated_at?: number
}
export interface IMessageMap {
  [key: string]: IMessage
}
