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
      class="d-flex flex-column w-100 pt-1 content-container"
      :class="mdAndDown && !isAssistant ? 'align-end' : 'align-start'"
    >
      <v-card
        class="pt-2"
        :style="{ maxWidth: xs ? '80%' : '90%' }"
        variant="text"
      >
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
      </v-card>
      <v-card-actions
        v-if="!editing"
        :style="{ padding: 0, minHeight: '18px !important' }"
      >
        <div v-if="peerIds.length > 1 && !running" class="mr-5 d-flex">
          <svg-icon
            icon-class="arrow-left"
            :style="`color: ${page === 1 ? '#888888' : 'black'}`"
            @click="page = page === 1 ? 1 : page - 1"
          />
          <span style="font-size: 0.75rem; line-height: 16px">
            {{ page }}/{{ peerIds.length }}
          </span>
          <svg-icon
            icon-class="arrow-right"
            :style="`color: ${page === peerIds.length ? '#888888' : 'black'}`"
            @click="page = page === peerIds.length ? peerIds.length : page + 1"
          />
        </div>
        <div class="actions-btn">
          <svg-icon
            v-if="isAssistant && !running"
            icon-class="refresh"
            size="18"
            style="color: #888888"
            @click="regenerate(message.parent)"
          />
        </div>
        <div class="actions-btn">
          <svg-icon
            v-if="!isAssistant && !running"
            icon-class="edit"
            size="18"
            style="color: #888888"
            @click="onEdit"
          />
        </div>
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

.actions-btn {
  display: none;
}
.actions-btn:hover {
  svg {
    color: black !important;
  }
}
.content-container:hover .actions-btn {
  display: flex;
}
</style>
