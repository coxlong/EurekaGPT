<template>
  <v-container class="fill-height flex-column pa-0" fluid>
    <div
      ref="scrollDiv"
      v-scroll.self="onScroll"
      class="flex-grow-1 flex-shrink-1 w-100 d-flex flex-column"
      style="flex-basis: 0; overflow-y: scroll"
    >
      <div v-if="conversation.meta.id === '' && !running">
        <v-row no-gutters>
          <v-col lg="6" offset-lg="3" md="8" offset-md="2">
            <v-text-field
              v-model="apiKey"
              label="ApiKey"
              variant="outlined"
              class="mt-2"
            />
          </v-col>
        </v-row>
      </div>
      <div v-for="id in messageIds" v-else :key="id">
        <v-row no-gutters>
          <v-col lg="6" offset-lg="3" md="8" offset-md="2">
            <message :message-id="id" :conversation="conversation" />
          </v-col>
        </v-row>
      </div>
    </div>
    <div class="w-100">
      <v-btn @click="onClear">New</v-btn>
      <div>
        <v-textarea
          v-model="prompt"
          variant="outlined"
          auto-grow
          rows="1"
          class="prompt_input"
        >
          <template #append-inner>
            <v-icon
              v-if="!running"
              :color="
                prompt !== ''
                  ? theme.global.current.value.colors['on-background']
                  : ''
              "
              :class="{ 'opacity-1': prompt != '' }"
              @click="onSubmit"
            >
              mdi-rocket-launch
            </v-icon>
            <v-icon
              v-else
              :color="theme.global.current.value.colors['on-background']"
              @click="onCancel"
            >
              mdi-stop-circle
            </v-icon>
          </template>
        </v-textarea>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { v4 as uuidv4 } from 'uuid'
import { Conversation } from '@/models/conversation'
import { Role } from '@/models/constants'
import OpenAI from 'openai'

const theme = useTheme()
const router = useRouter()
const apiKey = ref<string>('')
const prompt = ref<string>('')
const running = ref<boolean>(false)
const prevScrollPosition = ref(0)
const allowAutoScroll = ref(false)
const conversation = ref(new Conversation())
const cancelFun = ref<Function | null>(null)
const scrollDiv = ref<HTMLElement | null>(null)

const messageIds = computed(() => {
  return conversation.value.getMessageIds(
    conversation.value.meta.current_node_id
  )
})

const onSubmit = async () => {
  running.value = true
  const parent_id = conversation.value.meta.current_node_id
  const question = {
    id: uuidv4(),
    parent: parent_id,
    role: Role.User,
    content: prompt.value
  }
  conversation.value.pushMessage(question)
  prompt.value = ''
  scrollToBottom()
  const create = conversation.value.meta.id === ''

  const openai = new OpenAI({
    apiKey: apiKey.value,
    baseURL: window.location.origin + import.meta.env.VITE_APP_BASE_API,
    dangerouslyAllowBrowser: true
  })
  openai.chat.completions
    .create(conversation.value.buildCompletionsRequest())
    .then(async (stream) => {
      cancelFun.value = () => {
        stream.controller.abort()
      }
      allowAutoScroll.value = true
      for await (const chunk of stream) {
        if (chunk.id !== conversation.value.meta.current_node_id) {
          if (create) {
            conversation.value.meta.id = chunk.id
          }
          conversation.value.pushMessage({
            id: chunk.id,
            role: 'assistant',
            parent: conversation.value.meta.current_node_id,
            content: ''
          })
        }
        conversation.value.appendContent(chunk.choices[0]?.delta.content ?? '')
        if (allowAutoScroll.value) {
          scrollToBottom()
        }
      }
    })
    .catch((e) => {
      snackbar.error(e.error.message)
    })
    .finally(() => {
      running.value = false
      cancelFun.value = null
    })
}
const onCancel = () => {
  if (cancelFun.value !== null) {
    cancelFun.value()
    cancelFun.value = null
  }
}

const onClear = () => {
  conversation.value.clear()
  router.push('/')
}

const onScroll = (e: any) => {
  if (e.target.scrollTop < prevScrollPosition.value) {
    allowAutoScroll.value = false
  }
  if (e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight) {
    allowAutoScroll.value = true
  }

  prevScrollPosition.value = e.target.scrollTop
}

const scrollToBottom = async () => {
  nextTick(() => {
    if (scrollDiv.value) {
      scrollDiv.value.scrollTop +=
        scrollDiv.value.scrollHeight - scrollDiv.value.scrollTop
    }
  })
}
conversation.value.scrollToBottom = scrollToBottom

const handleKeyDown = (event: any) => {
  if (event.keyCode === 13 && event.ctrlKey) {
    if (running.value) {
      onCancel()
    } else {
      onSubmit()
    }
  }
}
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.prompt_input :deep(.v-field__append-inner) {
  align-items: flex-end;
  padding-bottom: var(--v-input-padding-top, 8px);
  .opacity-1 {
    opacity: 1;
  }
}
</style>
