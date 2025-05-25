import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { autocompleteService } from '@/services/autocompleteService'
import type { AutocompleteItem } from '@/types/autocomplete.types'

export const useAutocompleteStore = defineStore('autocomplete', () => {
  // Estado
  const fontesPagadoras = ref<AutocompleteItem[]>([])
  const obras = ref<AutocompleteItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getFontesPagadorasOptions = computed(() => {
    return fontesPagadoras.value.map(item => ({
      value: item.id,
      label: item.nome
    }))
  })

  const getObrasOptions = computed(() => {
    return obras.value.map(item => ({
      value: item.id,
      label: item.nome
    }))
  })

  // Actions
  const fetchFontesPagadoras = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await autocompleteService.getFontesPagadoras()
      fontesPagadoras.value = response.data
    } catch (err: any) {
      console.error('Erro ao buscar fontes pagadoras:', err)
      error.value = err.response?.data?.message || 'Erro ao buscar fontes pagadoras'
    } finally {
      loading.value = false
    }
  }

  const fetchObras = async (clienteId?: number) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await autocompleteService.getObras(clienteId)
      obras.value = response.data
    } catch (err: any) {
      console.error('Erro ao buscar obras:', err)
      error.value = err.response?.data?.message || 'Erro ao buscar obras'
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // Estado
    fontesPagadoras,
    obras,
    loading,
    error,
    
    // Getters
    getFontesPagadorasOptions,
    getObrasOptions,
    
    // Actions
    fetchFontesPagadoras,
    fetchObras,
    clearError
  }
})
