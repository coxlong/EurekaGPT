<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app :temporary="mobile">
      <template #prepend>
        <v-list-item color="black" rounded="lg" class="mx-2" @click="onClear">
          <template #prepend>
            <v-avatar>
              <svg-icon icon-class="openai" size="25" />
            </v-avatar>
            <span class="text-body-2"> New Chat</span>
          </template>

          <template #append> <svg-icon icon-class="new-chat" /> </template>
        </v-list-item>
        <v-divider />
      </template>

      <v-list @click:select="onToggleConversation">
        <v-list-item
          v-for="item in items"
          :key="item.value"
          :value="item.value"
          :active="conversations.current.meta.id === item.value"
          color="black"
          rounded="lg"
          class="mx-2"
          :style="{ minHeight: '40px' }"
        >
          <v-list-item-subtitle
            v-if="item.type === 'subheader'"
            :style="{ fontSize: '.8rem' }"
          >
            {{ item.title }}
          </v-list-item-subtitle>
          <p v-else class="">{{ item.title }}</p>
        </v-list-item>
      </v-list>

      <template #append>
        <v-divider />
        <v-list>
          <v-list-item
            :prepend-avatar="userStore.avatar"
            :title="userStore.username"
            :subtitle="`${userStore.email}`"
            color="primary"
            rounded="xl"
          >
            <template #append>
              <v-btn size="small" variant="text" icon="mdi-menu-down" />
            </template>
          </v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>
    <v-app-bar app :elevation="0">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>Chat</v-toolbar-title>
    </v-app-bar>

    <v-main class="fill-height">
      <chat-box />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useUserStore } from '@/stores/user'
import { useConversationsStore } from '@/stores/conversations.ts'

const { mobile } = useDisplay()
const drawer = ref(!mobile.value)
const userStore = useUserStore()
const conversations = useConversationsStore()
const router = useRouter()

onMounted(() => {
  conversations.updateHistory(false)
})

const items = computed(() => {
  const result: any[] = []
  const flag = {} as any
  const today = new Date()
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59,
    999
  )
  conversations.history.forEach((item) => {
    const itemDate = new Date(item.updated_at ?? 0)
    const diffMilliseconds = endOfDay.getTime() - itemDate.getTime()
    const diffDay = Math.floor(diffMilliseconds / (24 * 3600 * 1000))
    if (diffDay < 1) {
      if (flag.today === undefined) {
        result.push({ type: 'subheader', title: '今天' })
        flag.today = true
      }
    } else if (diffDay < 2) {
      if (flag.yesterday === undefined) {
        result.push({ type: 'subheader', title: '昨天' })
        flag.yesterday = true
      }
    } else if (diffDay < 7) {
      if (flag.week === undefined) {
        result.push({ type: 'subheader', title: '最近一周' })
        flag.week = true
      }
    } else if (diffDay < 30) {
      if (flag.month === undefined) {
        result.push({ type: 'subheader', title: '最近一个月' })
        flag.month = true
      }
    } else {
      if (flag.more === undefined) {
        result.push({ type: 'subheader', title: '更早' })
        flag.more = true
      }
    }
    result.push({
      title: item.title === '' ? 'New chat ' : item.title,
      value: item.id
    })
  })
  return result
})

const onToggleConversation = (item: any) => {
  router.push(`/c/${item.id}`)
}

const onClear = () => {
  conversations.current.clear()
  router.push('/')
}
</script>

<style scoped></style>
