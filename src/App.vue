<template>
  <router-view />
  <v-snackbar
    v-model="snackbarStore.visible"
    rounded="pill"
    :timeout="2000"
    color="error"
  >
    {{ snackbarStore.text }}
    <template #actions>
      <v-btn variant="text" @click="snackbarStore.visible = false">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { useSnackbarStore } from '@/stores/snackbar.ts'
const snackbarStore = useSnackbarStore()
</script>

<style scoped></style>
