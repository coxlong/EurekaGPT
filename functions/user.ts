/*eslint no-undef: "off"*/
import type { PluginData } from '@cloudflare/pages-plugin-cloudflare-access'

export const onRequest: PagesFunction<unknown, any, PluginData> = async ({
  request,
  data
}) => {
  const arr = data.cloudflareAccess.JWT.payload.email.split('@')
  return new Response(
    JSON.stringify({
      username: arr[0],
      email: data.cloudflareAccess.JWT.payload.email
    })
  )
}
