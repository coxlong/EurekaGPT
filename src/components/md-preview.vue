<template>
  <div v-enhance-code class="md-div" v-html="htmlText"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import useClipboard from 'vue-clipboard3'
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import { escape } from './helpers'

const { toClipboard } = useClipboard()

const props = defineProps<{
  text: string
}>()

//自定义指令增强代码块功能
const vEnhanceCode = (el: HTMLElement) => {
  let btnArr = el.querySelectorAll('.copy-code-btn')
  btnArr.forEach((btn, _) => {
    if (btn) {
      btn.removeEventListener('click', () => {})
    }
    btn!.addEventListener('click', () => {
      const id = btn.getAttribute('codeId')
      if (id) {
        const codeBlock = el.querySelector(`#${id}`)
        if (codeBlock) {
          toClipboard((codeBlock as HTMLElement).innerText)

          snackbar.success('复制成功')
        }
      }
    })
  })
}

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang, _) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext'
      return hljs.highlight(code, { language }).value
    }
  }),
  {
    renderer: {
      code(code: string, infostring: string | undefined, escaped: boolean) {
        const lang = (infostring || '').match(/^\S*/)?.[0]
        code = code.replace(/\n$/, '') + '\n'
        if (!lang) {
          return (
            '<pre><code>' +
            (escaped ? code : escape(code, true)) +
            '</code></pre>\n'
          )
        }
        const id = 'code-' + new Date().getTime().toString()
        return `<pre><div><div class="d-flex justify-space-between"><span>${escape(
          lang
        )}</span><button class="copy-code-btn" codeId=${id} @click="copyCode(\`${escape(
          code,
          true
        )}\`)">复制</button></div><div ><code id=${id} class="language-${escape(
          lang
        )}">${escaped ? code : escape(code, true)}</code></div></div></pre>`
      }
    }
  }
)

const htmlText = computed(() => {
  return marked.parse(props.text)
})
</script>
