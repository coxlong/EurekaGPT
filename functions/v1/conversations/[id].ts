import { Env, IConversationMeta } from '../types'

/*eslint no-undef: "off"*/
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const user = 'hello'
  const conversationKey = `c:${user}:${context.params.id}`
  const data =
    await context.env.EurekaKV.getWithMetadata<IConversationMeta>(
      conversationKey
    )
  if (data.value === null) {
    return new Response(`conversation(${context.params.id}) not fount`, {
      status: 404
    })
  }

  return new Response(
    JSON.stringify({
      meta: data.metadata,
      messages: JSON.parse(data.value)
    }),
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
}
