/*eslint no-undef: "off"*/
import OpenAI from 'openai'
import { ChatCompletionCreateParamsBase } from 'openai/resources/chat/completions'

interface Env {
  KV: KVNamespace
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request } = context
  const apiKey = context.request.headers.get('Authorization').split(' ')[1]
  const body = (await request.json()) as ChatCompletionCreateParamsBase

  const openai = new OpenAI({
    apiKey: apiKey
  })
  try {
    if (body.stream) {
      const stream = await openai.chat.completions.create(body)

      const headers = new Headers({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      })

      // 创建一个ReadableStream用于response body
      const sseStream = new ReadableStream({
        start: async (controller) => {
          for await (const chunk of stream) {
            console.log('chunk', JSON.stringify(chunk))
            // 把chunk发送给客户端
            const data = `data: ${JSON.stringify(chunk)}\n\n`
            controller.enqueue(new TextEncoder().encode(data))
          }
          controller.close()
        },
        cancel: () => {
          // 这里可以处理如果客户端关闭了连接的逻辑
        }
      })

      return new Response(sseStream, { headers })
    }
    const resp = await openai.chat.completions.create(body)
    return new Response(JSON.stringify(resp))
  } catch (err) {
    return new Response(`${err.message}\n${err.stack}`, { status: 500 })
  }
}
