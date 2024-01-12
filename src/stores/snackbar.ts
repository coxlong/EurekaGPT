import { defineStore } from 'pinia'

export const useSnackbarStore = defineStore('snackbar', {
  state: () => ({
    visible: false,
    text: ''
  }),
  actions: {
    updateVisible(visible: boolean) {
      this.visible = visible
    },
    updateText(text: string) {
      this.text = text
    },
    show(text: string) {
      this.text = text
      this.visible = true
    }
  }
})
