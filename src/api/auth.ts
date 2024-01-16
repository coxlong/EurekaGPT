import { IUser } from '@/models/user'
import request from './request'

export function GetUser(): Promise<IUser> {
  return request({
    url: '/auth/user',
    method: 'GET'
  })
}

export function login(provider: string): Promise<string> {
  return request({
    url: `/auth/login/${provider}`,
    method: 'GET'
  })
}
