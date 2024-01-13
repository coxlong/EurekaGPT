/*eslint no-undef: "off"*/
import type { PluginData } from '@cloudflare/pages-plugin-cloudflare-access'
import { Env, IConversationMeta } from './types'

export const onRequestGet: PagesFunction<Env, any, PluginData> = async (
  context
) => {
  const prefix = `c:${context.data.cloudflareAccess.JWT.payload.email}:`
  const value = await context.env.EurekaKV.list<IConversationMeta>({
    prefix: prefix
  })

  const result: IConversationMeta[] = []
  value.keys.forEach((ele) => {
    result.push(ele.metadata)
  })
  result.sort((a, b) => {
    return b.updated_at - a.updated_at
  })
  return new Response(JSON.stringify(result), {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
