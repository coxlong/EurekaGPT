/*eslint no-undef: "off"*/
import type { PluginData } from '@cloudflare/pages-plugin-cloudflare-access'
import { getIdentity } from '@cloudflare/pages-plugin-cloudflare-access/api'
import { parse } from 'cookie'

export const onRequest: PagesFunction<unknown, any, PluginData> = async ({
  request,
  data
}) => {
  const cookie = parse(request.headers.get('Cookie') || '')
  const identity = await getIdentity({
    jwt: cookie.CF_Authorization,
    domain: 'https://geekkit.cloudflareaccess.com'
  })
  const user: any = {}
  if (identity.idp.type === 'onetimepin') {
    user.username = identity.email.split('@')[0]
    user.email = identity.email
    user.avatar = getGravatarUrl(identity.email)
  } else if (identity.idp.type === 'github') {
    user.username = identity.name
    user.email = identity.email
    user.avatar = `https://avatars.githubusercontent.com/u/${identity.id}?v=4`
  }
  return new Response(JSON.stringify(user), {
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

async function getGravatarUrl(email: string): Promise<string> {
  const trimmedEmail = email.trim().toLowerCase()
  const hash = await sha256(trimmedEmail)
  return `https://www.gravatar.com/avatar/${hash}?s=200&d=identicon`
}

async function sha256(str: string) {
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(str)
  )
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}
