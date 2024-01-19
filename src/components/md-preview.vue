<template>
  <MdPreview :model-value="text" preview-theme="github" />
</template>

<script setup lang="ts">
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'

defineProps<{
  text: string
}>()
</script>

<style scoped>
:deep(.md-editor-preview-wrapper) {
  padding: 0;
}
</style>
