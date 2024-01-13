/*eslint no-undef: "off"*/
import cloudflareAccessPlugin from '@cloudflare/pages-plugin-cloudflare-access'
import { Env } from './v1/types'

async function errorHandler(context) {
  try {
    return await context.next()
  } catch (err) {
    return new Response(`${err.message}\n${err.stack}`, { status: 500 })
  }
}

const authentication: PagesFunction<Env> = (context) => {
  if (context.env.DEVELOP) {
    context.data = {
      cloudflareAccess: {
        JWT: {
          payload: {
            email: 'coxlong@qq.com'
          }
        }
      }
    }
    return context.next()
  }
  return cloudflareAccessPlugin({
    domain: 'https://geekkit.cloudflareaccess.com',
    aud: '64f8c7e501c19b0780b11e31b05bde8755d4559aeb62c911780361d6007acb55'
  })(context)
}

export const onRequest = [errorHandler, authentication]
