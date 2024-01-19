<template>
  <div
    class="d-flex"
    :class="{ 'flex-row-reverse': mdAndDown && !isAssistant }"
  >
    <v-avatar v-if="isAssistant" class="ma-2" size="30">
      <svg-icon icon-class="chat" size="30" style="color: black" />
    </v-avatar>
    <v-avatar v-else class="ma-2" size="30">
      <img :src="userStore.avatar" class="w-100" :alt="userStore.username" />
    </v-avatar>
    <div
      class="d-flex flex-column w-100 pt-1"
      :class="mdAndDown && !isAssistant ? 'align-end' : 'align-start'"
    >
      <div class="pa-2" :style="{ maxWidth: xs ? '80%' : '90%' }">
        <div>
          <v-window v-model="page">
            <v-window-item
              v-for="(id, idx) in peerIds"
              :key="idx"
              :value="idx + 1"
            >
              <v-textarea
                v-if="editing"
                v-model="input"
                label="Label"
                variant="solo"
              />
              <md-preview v-else :text="conversation.getMessage(id).content" />
            </v-window-item>
          </v-window>
        </div>
      </div>
      <v-card-actions v-if="!editing">
        <v-pagination
          v-if="peerIds.length > 1"
          v-model="page"
          :length="peerIds.length"
          :total-visible="peerIds.length"
          size="x-small"
          density="comfortable"
          rounded="circle"
          class="message-pagination"
        />
        <v-btn
          v-if="isAssistant && !running"
          density="compact"
          icon="mdi-refresh"
          @click="regenerate(message.parent)"
        />
        <v-btn
          v-if="!isAssistant && !running"
          density="compact"
          icon="mdi-pencil"
          @click="onEdit"
        />
      </v-card-actions>
      <v-card-actions v-else>
        <v-btn density="compact" icon="mdi-refresh" @click="onResubmit">
          确定
        </v-btn>
        <v-btn density="compact" icon="mdi-refresh" @click="editing = false">
          取消
        </v-btn>
      </v-card-actions>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Role } from '@/models/constants'
import { computed, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useUserStore } from '@/stores/user'
import { Conversation } from '@/models/conversations'

const { mdAndDown, xs } = useDisplay()
const userStore = useUserStore()
const props = defineProps<{
  messageId: string
  conversation: Conversation
  running: boolean
  regenerate: Function
  resubmit: Function
}>()
const peerIds = props.conversation.getPeerIds(props.messageId)
let messageIdx = 0
for (let i = 0; i < peerIds.length; i++) {
  if (peerIds[i] === props.messageId) {
    messageIdx = i + 1
    break
  }
}

const editing = ref(false)
const input = ref('')

const page = ref(messageIdx)
const message = computed(() => {
  return props.conversation.getMessage(props.messageId)
})
const isAssistant = computed(() => message.value.role === Role.Assistant)
watch(page, (newValue) => {
  props.conversation.toggleMessage(peerIds[newValue - 1])
})

const onResubmit = () => {
  editing.value = false
  props.resubmit(input.value, props.messageId)
  props.conversation.clearResubmit()
}

const onEdit = () => {
  input.value = message.value.content
  editing.value = true
  props.conversation.setResubmit(() => {
    onResubmit()
  })
}
</script>

<style scoped>
.message-pagination :deep(.v-pagination__prev),
.message-pagination :deep(.v-pagination__next) {
  display: none;
}
.message-pagination :deep(.v-pagination__item) {
  margin-left: 0;
  margin-right: 0;
}
</style>
