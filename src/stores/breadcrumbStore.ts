import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBreadcrumbStore = defineStore('breadcrumb', () => {
  // O ID do cliente atualmente em contexto para o breadcrumb
  const currentClienteId = ref<number|null>(null)
  // Aba ativa do contexto do cliente
  const activeTab = ref<string|null>(null)

  function setClienteId(id: number|null) {
    currentClienteId.value = id
  }
  function setActiveTab(tab: string|null) {
    activeTab.value = tab
  }

  return {
    currentClienteId,
    setClienteId,
    activeTab,
    setActiveTab,
  }
})
