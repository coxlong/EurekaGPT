/*eslint no-undef: "off"*/
import type { PluginData } from '@cloudflare/pages-plugin-cloudflare-access'
import {
  ChatCompletionChunk,
  ChatCompletionCreateParamsBase,
  ChatCompletionMessageParam
} from 'openai/resources/chat/completions'
import { Stream } from 'openai/streaming'

import { v4 as uuidv4 } from 'uuid'
import {
  ChatCompletionRequestParams,
  Env,
  IConversationMeta,
  IMessageMap
} from '../types'

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const requestBody =
    (await context.request.json()) as ChatCompletionRequestParams
  const controller = new AbortController()
  const response = await fetch(
    context.env.OPENAI_API_BASE + '/chat/completions',
    {
      method: 'POST',
      headers: context.request.headers,
      body: JSON.stringify(buildOpenAIRequest(requestBody)),
      signal: controller.signal
    }
  )
  if (response.status !== 200) {
    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
      statusText: response.statusText
    })
  }
  const contentType = response.headers.get('Content-Type')

  if (!(contentType && contentType.includes('text/event-stream'))) {
    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
      statusText: response.statusText
    })
  }

  const stream = Stream.fromSSEResponse<ChatCompletionChunk>(
    response,
    controller
  )

  let content = ''
  const newId = uuidv4()
  const sseStream = new ReadableStream({
    start: async (controller) => {
      for await (const chunk of stream) {
        content += chunk.choices[0]?.delta.content ?? ''
        chunk.id = newId
        // 把chunk发送给客户端
        const data = `data: ${JSON.stringify(chunk)}\n\n`
        controller.enqueue(new TextEncoder().encode(data))
      }
      await save(requestBody, content, newId, context)
      controller.close()
    },
    cancel: async () => {
      // 这里可以处理如果客户端关闭了连接的逻辑
      await save(requestBody, content, newId, context)
    }
  })
  return new Response(sseStream, {
    status: response.status,
    headers: response.headers,
    statusText: response.statusText
  })
}

function buildOpenAIRequest(
  requestBody: ChatCompletionRequestParams
): ChatCompletionCreateParamsBase {
  const { id, messages, ...a } = requestBody
  const messageList: ChatCompletionMessageParam[] = []
  messages.forEach((ele) => {
    messageList.push({
      role: ele.role,
      content: ele.content
    })
  })
  return {
    messages: messageList,
    ...a
  }
}

async function save(
  request: ChatCompletionRequestParams,
  answer: string,
  answerId: string,
  context: EventContext<Env, any, PluginData>
) {
  const conversationId = request.id === '' ? answerId : request.id
  let messageMap: IMessageMap = {}
  const meta: IConversationMeta = {
    id: conversationId,
    model: request.model,
    current_node_id: answerId,
    ...(request.max_tokens && { max_tokens: request.max_tokens }),
    ...(request.temperature && { temperature: request.temperature }),
    updated_at: Date.now()
  }
  const conversationKey = `c:${context.data.cloudflareAccess.JWT.payload.email}:${conversationId}`
  if (conversationId !== answerId) {
    const old =
      await context.env.EurekaKV.getWithMetadata<IConversationMeta>(
        conversationKey
      )
    meta.title = old.metadata.title
    meta.created_at = old.metadata.created_at
    messageMap = JSON.parse(old.value) as IMessageMap
  } else {
    meta.created_at = meta.updated_at
    meta.title = ''
  }

  request.messages.forEach((ele) => {
    if (ele.id && messageMap[ele.id] === undefined) {
      messageMap[ele.id] = {
        id: ele.id,
        parent: ele.parent,
        role: ele.role,
        content: ele.content,
        created_at: Date.now()
      }
    }
  })
  messageMap[answerId] = {
    id: answerId,
    parent: request.messages[request.messages.length - 1].id,
    role: 'assistant',
    content: answer,
    created_at: Date.now()
  }

  const v = JSON.stringify(messageMap)

  await context.env.EurekaKV.put(conversationKey, v, { metadata: meta })
  const res = await context.env.EurekaKV.getWithMetadata(conversationKey)
}
