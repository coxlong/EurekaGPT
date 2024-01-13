<template>
  <div
    class="d-flex"
    :class="{ 'flex-row-reverse': mdAndDown && !isAssistant }"
  >
    <v-avatar v-if="isAssistant" color="primary" class="ma-2">
      <svg-icon icon-class="chat" size="30" />
    </v-avatar>
    <v-avatar v-else color="red" class="ma-2">
      <span class="text-h5" style="text-transform: uppercase !important">{{
        userStore.username.at(0)
      }}</span>
    </v-avatar>
    <div
      class="d-flex flex-column w-100 pt-3"
      :class="mdAndDown && !isAssistant ? 'align-end' : 'align-start'"
    >
      <v-card max-width="80%">
        <div class="pa-1">
          <v-window v-model="page">
            <v-window-item
              v-for="(id, idx) in peerIds"
              :key="idx"
              :value="idx + 1"
            >
              {{ conversation.getMessage(id).content }}
            </v-window-item>
          </v-window>
        </div>
      </v-card>
      <v-card-actions>
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

const { mdAndDown } = useDisplay()
const userStore = useUserStore()
const props = defineProps<{
  messageId: string
  conversation: Conversation
}>()
const peerIds = props.conversation.getPeerIds(props.messageId)
let messageIdx = 0
for (let i = 0; i < peerIds.length; i++) {
  if (peerIds[i] === props.messageId) {
    messageIdx = i + 1
    break
  }
}

const page = ref(messageIdx)
const isAssistant = computed(
  () => props.conversation.getMessage(props.messageId).role === Role.Assistant
)
watch(page, (newValue) => {
  props.conversation.toggleMessage(peerIds[newValue - 1])
})
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
