/*eslint no-undef: "off"*/
import { Env, IConversationMeta } from './types'

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const user = 'hello'
  const prefix = `c:${user}:`
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
