// exemploStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { exemploService } from '@/services/exemploService'
import type { PaginationMeta } from '@/types/api.types'
import { useNotificationStore } from '@/stores/notificationStore'
import type { 
  Exemplo, 
  ExemploFilter, 
  ExemploAutocompleteItem
} from '@/types/exemplo.types'

export const useExemploStore = defineStore('exemplo', () => {
  // Estado
  const exemplos = ref<Exemplo[]>([])
  const exemplo = ref<Exemplo | null>(null)
  const loading = ref(false)
  const filters = ref<ExemploFilter>({})
  const exemplosAutocomplete = ref<ExemploAutocompleteItem[]>([])
  const storeFetchError = ref<string | null>(null)
  const storeAutocompleteError = ref<string | null>(null)
  const pagination = ref<PaginationMeta>({
    page: 1,
    per_page: 15,
    current_page: 1,
    from: 0,
    last_page: 0,
    links: [],
    path: '',
    to: 0,
    total: 0
  })

  const notificationStore = useNotificationStore()

  // Actions
  const sortBy = ref<string>('id')
  const sortDirection = ref<'asc' | 'desc'>('asc')

  const fetchExemplos = async () => {
    try {
      loading.value = true
      const response = await exemploService.getExemplos({
        page: pagination.value.current_page,
        per_page: pagination.value.per_page,
        sort_by: sortBy.value,
        direction: sortDirection.value,
        ...filters.value
      })
      exemplos.value = response.data
      pagination.value = response.meta
      loading.value = false
    } catch (error) {
      storeFetchError.value = error.message
      notificationStore.addNotification(
        'Erro ao buscar exemplos',
        'error',
        3000
      )
    } finally {
      loading.value = false
    }
  }

  const fetchExemplo = async (id: number) => {
    try {
      loading.value = true
      const response = await exemploService.getExemplo(id)
      exemplo.value = response.data
    } catch (error) {
      storeFetchError.value = error.message
      notificationStore.addNotification(
        'Erro ao buscar exemplo',
        'error',
        3000
      )
    } finally {
      loading.value = false
    }
  }

  const createExemplo = async (exemplo: Exemplo) => {
    try {
      loading.value = true
      const response = await exemploService.createExemplo(exemplo)
      exemplo.value = response.data
      notificationStore.addNotification(
        'Exemplo criado com sucesso',
        'success',
        3000
      )
    } catch (error) {
      storeFetchError.value = error.message
      notificationStore.addNotification(
        'Erro ao criar exemplo',
        'error',
        3000
      )
    } finally {
      loading.value = false
    }
  }

  const updateExemplo = async (id: number, exemplo: Exemplo) => {
    try {
      loading.value = true
      const response = await exemploService.updateExemplo(id, exemplo)
      exemplo.value = response.data
      notificationStore.addNotification(
        'Exemplo atualizado com sucesso',
        'success',
        3000
      )
    } catch (error) {
      storeFetchError.value = error.message
      notificationStore.addNotification(
        'Erro ao atualizar exemplo',
        'error',
        3000
      )
    } finally {
      loading.value = false
    }
  }

  const fetchExemplosAutocomplete = async () => {
    try {
    const response = await exemploService.getExemplosAutocomplete()
    exemplosAutocomplete.value = response.data
    } catch (error) {
      storeAutocompleteError.value = error.message
      notificationStore.addNotification(
        'Erro ao buscar exemplos para o select',
        'error',
        3000
      )
    } finally {
      loading.value = false
    }
  }

  const deleteExemplo = async (exemplo: Exemplo) => {
    try {
      loading.value = true
      const response = await exemploService.deleteExemplo(exemplo.id)
      fetchExemplos()
      loading.value = false
      notificationStore.addNotification(
        'Exemplo excluído com sucesso',
        'success',
        3000
      )
    } catch (error) {
      notificationStore.addNotification(
        'Erro ao excluir exemplo',
        'error',
        3000
      )
    } finally {
      loading.value = false
    }
  }

  return {
    // Estado
    exemplos,
    exemplo,
    loading,
    filters,
    exemplosAutocomplete,
    pagination,
    sortBy,
    sortDirection,
    storeFetchError,
    storeAutocompleteError,    
    // Actions
    fetchExemplos,
    fetchExemplo,
    createExemplo,
    updateExemplo,
    fetchExemplosAutocomplete,
    deleteExemplo
  }
})
