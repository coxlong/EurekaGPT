import { defineStore } from 'pinia'

export const useSnackbarStore = defineStore('snackbar', {
  state: () => ({
    visible: false,
    text: '',
    color: ''
  }),
  actions: {
    show(text: string, color: string) {
      this.text = text
      this.visible = true
      this.color = color
    }
  }
})
