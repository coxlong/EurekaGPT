<template>
  <v-container class="fill-height flex-column pa-0" fluid>
    <div
      ref="scrollDiv"
      v-scroll.self="onScroll"
      class="flex-grow-1 flex-shrink-1 w-100 d-flex flex-column"
      style="flex-basis: 0; overflow-y: scroll; overflow-x: hidden"
    >
      <div
        v-if="
          conversations.current.mapping.size === 0 &&
          conversations.current.meta.current_node_id === ''
        "
      >
        <v-row no-gutters>
          <v-col lg="6" offset-lg="3" md="8" offset-md="2">
            <v-select
              v-model="conversations.current.meta.model"
              label="Model"
              :items="modelList"
              variant="solo"
            />
          </v-col>
          <v-col lg="6" offset-lg="3" md="8" offset-md="2">
            <v-text-field
              v-model="configStore.gpt_3_api_key"
              label="ApiKey3"
              variant="outlined"
              class="mt-2"
            />
          </v-col>
          <v-col lg="6" offset-lg="3" md="8" offset-md="2">
            <v-text-field
              v-model="configStore.gpt_4_api_key"
              label="ApiKey4"
              variant="outlined"
              class="mt-2"
            />
          </v-col>
        </v-row>
      </div>
      <div v-for="id in messageIds" v-else :key="id">
        <row-container>
          <message
            :message-id="id"
            :conversation="conversations.current"
            :regenerate="regenerate"
            :resubmit="resubmit"
            :running="running"
          />
        </row-container>
      </div>
    </div>
    <div class="w-100">
      <div>
        <row-container>
          <v-textarea
            v-model="prompt"
            variant="outlined"
            auto-grow
            rows="1"
            max-rows="10"
            rounded="xl"
            class="prompt_input"
            placeholder="Message ChatGPT…"
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
        </row-container>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { v4 as uuidv4 } from 'uuid'
import { Role } from '@/models/constants'
import { useConversationsStore } from '@/stores/conversations.ts'
import { useConfigStore } from '@/stores/config'
import { StreamCompletions } from '@/api/conversations'

const theme = useTheme()
const router = useRouter()
const prompt = ref<string>('')
const running = ref<boolean>(false)
const prevScrollPosition = ref(0)
const allowAutoScroll = ref(false)
const cancelFun = ref<Function | null>(null)
const scrollDiv = ref<HTMLElement | null>(null)
const conversations = useConversationsStore()
const configStore = useConfigStore()

const modelList = ['gpt-4-1106-preview', 'gpt-4', 'gpt-3.5-turbo']

const messageIds = computed(() => {
  return conversations.current.getMessageIds(
    conversations.current.meta.current_node_id
  )
})

const onSubmit = async () => {
  const parent_id = conversations.current.meta.current_node_id
  const question = {
    id: uuidv4(),
    parent: parent_id,
    role: Role.User,
    content: prompt.value
  }
  const newMsg = new Set([question.id])
  conversations.current.pushMessage(question)
  prompt.value = ''
  scrollToBottom()
  const create = conversations.current.meta.id === ''
  request(create, newMsg)
}

const resubmit = (qContent: string, oldQuestionId: string) => {
  const oldQuestion = conversations.current.getMessage(oldQuestionId)
  const parent_id = oldQuestion.parent
  conversations.current.meta.current_node_id = parent_id
  const question = {
    id: uuidv4(),
    parent: parent_id,
    role: Role.User,
    content: qContent
  }
  const newMsg = new Set([question.id])
  conversations.current.pushMessage(question)
  request(false, newMsg)
}

const regenerate = (questionId: string) => {
  conversations.current.meta.current_node_id = questionId
  request(false, new Set<string>())
}

const request = (create: boolean, newMsg: Set<string>) => {
  running.value = true
  StreamCompletions(
    configStore.getAPIKeyByModel(conversations.current.meta.model),
    conversations.current.buildCompletionsRequest(newMsg)
  )
    .then(async (stream) => {
      cancelFun.value = () => {
        stream.controller.abort()
      }
      allowAutoScroll.value = true
      for await (const chunk of stream) {
        if (chunk.id !== conversations.current.meta.current_node_id) {
          if (create) {
            conversations.current.meta.id = chunk.id
          }
          conversations.current.pushMessage({
            id: chunk.id,
            role: 'assistant',
            parent: conversations.current.meta.current_node_id,
            content: ''
          })
        }
        conversations.current.appendContent(
          chunk.choices[0]?.delta.content ?? ''
        )
        if (allowAutoScroll.value) {
          scrollToBottom()
        }
      }
      if (create) {
        conversations.updateHistory(true)
        router.push(`/c/${conversations.current.meta.id}`)
      }
    })
    .catch((e) => {
      snackbar.error(e?.error?.message ?? e)
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
conversations.current.scrollToBottom = scrollToBottom

const handleKeyDown = (event: any) => {
  if (event.keyCode === 13 && event.ctrlKey) {
    if (running.value) {
      onCancel()
    } else {
      if (conversations.current.resubmit === null) {
        onSubmit()
      } else {
        conversations.current.resubmit()
      }
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
