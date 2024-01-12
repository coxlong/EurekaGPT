import { UserConfig, ConfigEnv, loadEnv, defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { resolve } from 'path'
import vuetify from 'vite-plugin-vuetify'

const pathSrc = resolve(__dirname, 'src')

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd())
  return {
    resolve: {
      alias: {
        '@': pathSrc
      }
    },
    plugins: [
      vue(),
      vuetify(),
      Components({
        resolvers: []
      }),
      createSvgIconsPlugin({
        // 指定需要缓存的图标文件夹
        iconDirs: [resolve(pathSrc, 'assets/icons')],
        // 指定symbolId格式
        symbolId: 'icon-[dir]-[name]'
      })
    ],
    server: {
      // 允许IP访问
      host: '0.0.0.0',
      // 应用端口 (默认:3000)
      port: Number(env.VITE_APP_PORT),
      // 运行是否自动打开浏览器
      open: false,
      proxy: {
        ['/v1']: {
          changeOrigin: true,
          target: env.VITE_APP_API_URL,
          rewrite: (path) => path
        }
      }
    }
  }
})
