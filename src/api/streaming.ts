import { Stream } from 'openai/streaming'

export async function streamRequest<T>(
  url: string,
  headers: any,
  data: Object
): Promise<Stream<T>> {
  const controller = new AbortController()
  const response = await fetch(import.meta.env.VITE_APP_BASE_API + url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data),
    credentials: 'include',
    signal: controller.signal
  })
  if (!response.ok) {
    const error = await response.json()
    throw error
  }
  const stream = Stream.fromSSEResponse<T>(response, controller)
  return stream
}
