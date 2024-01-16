<template>
  <div>
    <v-img class="mx-auto my-6" max-height="60" src="/chat.svg" />
    <v-card
      class="mx-auto pa-12 pb-8"
      elevation="8"
      max-width="400"
      rounded="lg"
    >
      <div class="text-h6 text-center mb-8">Sign in with</div>

      <!-- GitHub Login Button -->
      <v-btn
        block
        class="mb-4"
        size="large"
        elevation="2"
        @click="loginWith('github')"
      >
        <svg-icon icon-class="github-mark" size="25" class="mr-3" />
        GitHub
      </v-btn>

      <!-- Google Login Button -->
      <!-- <v-btn
        block
        class="mb-8"
        size="large"
        elevation="2"
        @click="loginWith('google')"
      >
        <svg-icon icon-class="google-2" size="25" class="mr-3" />
        Google
      </v-btn> -->
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import { login } from '@/api/auth'

const loginWith = (provider: string) => {
  login(provider).then((u) => {
    window.location.href = u
  })
}
</script>

<style scoped>
.v-btn {
  text-transform: none;
  font-size: 16px;
  font-weight: normal;
}
</style>
