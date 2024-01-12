<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app :temporary="mobile">
      history
      <template #append>
        <v-divider />
        <v-list>
          <v-list-item
            prepend-avatar="https://cdn.vuetifyjs.com/images/john.png"
            :title="userStore.username"
            :subtitle="`${userStore.username}@example.com`"
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
    <v-app-bar app :elevation="1">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>Chat</v-toolbar-title>
    </v-app-bar>

    <v-main class="fill-height">
      <chat-box />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useUserStore } from '@/stores/user'

const { mobile } = useDisplay()
const drawer = ref(!mobile.value)
const userStore = useUserStore()
</script>

<style scoped></style>
