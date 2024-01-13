import request from './request'
import { IConversation, IConversationMeta } from '@/models/conversations'

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
