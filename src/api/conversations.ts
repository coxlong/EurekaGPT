import {
  ChatCompletionChunk,
  ChatCompletionCreateParamsStreaming
} from 'openai/resources/chat/completions'
import request from './request'
import { IConversation, IConversationMeta } from '@/models/conversations'
import { streamRequest } from './streaming'
import { Stream } from 'openai/streaming'

export function StreamCompletions(
  apiKey: string,
  data: ChatCompletionCreateParamsStreaming
): Promise<Stream<ChatCompletionChunk>> {
  return streamRequest<ChatCompletionChunk>(
    '/chat/completions',
    {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    data
  )
}

export function GetConversationByID(id: string): Promise<IConversation> {
  return request({
    url: `/conversations/${id}`,
    method: 'GET'
  })
}

export function GetConversations(): Promise<IConversationMeta[]> {
  return request({
    url: '/conversations/',
    method: 'GET'
  })
}
