import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', {
  state: () => ({
    gpt_3_api_key: '',
    gpt_4_api_key: ''
  }),
  actions: {
    loadConfig(config: string | null) {
      if (config !== null) {
        const tmp = JSON.parse(config)
        this.gpt_3_api_key = tmp.gpt_3_api_key
        this.gpt_4_api_key = tmp.gpt_4_api_key
      }
    },
    saveConfig() {
      return JSON.stringify({
        gpt_3_api_key: this.gpt_3_api_key,
        gpt_4_api_key: this.gpt_4_api_key
      })
    },
    getAPIKeyByModel(model: string) {
      if (model.startsWith('gpt-4')) {
        return this.gpt_4_api_key
      }
      return this.gpt_3_api_key
    }
  }
})
