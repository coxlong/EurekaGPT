import { IUser } from '@/models/user'
import request from './request'

export function GetUser(): Promise<IUser> {
  return request({
    url: '/user',
    method: 'GET'
  })
}
