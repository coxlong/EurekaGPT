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
        return `<pre><div class="code-wrapper px-5 py-2 mt-3 mb-3 rounded-lg"><div class="code-header"><button class="copy-code-btn" codeId=${id}><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4 11L2 11C1.44771 11 0.999999 10.5523 0.999999 10L1 3C1 1.89543 1.89543 1 3 1L10 1C10.5523 1 11 1.44772 11 2L11 4M9 17L15 17C16.1046 17 17 16.1046 17 15L17 9C17 7.89543 16.1046 7 15 7L9 7C7.89543 7 7 7.89543 7 9L7 15C7 16.1046 7.89543 17 9 17Z" stroke="#888888" stroke-width="2" stroke-linecap="round"/>
</svg>
</button></div><div class="code-main"><code id=${id} class="language-${escape(
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

<style scoped>
:deep(.code-wrapper) {
  background-color: #fafafa;
  position: relative;
  line-height: normal;
}
:deep(.code-wrapper .code-header) {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}
:deep(.code-wrapper .code-main) {
  overflow-x: auto;
}
:deep(.copy-code-btn) {
  display: none;
}
:deep(pre:hover .copy-code-btn) {
  display: block;
}
</style>
