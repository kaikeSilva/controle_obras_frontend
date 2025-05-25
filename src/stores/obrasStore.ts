import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { obrasService, type GetObrasParams } from '@/services/obrasService'
import type { Obra, ObraForm, PaginationMeta } from '@/types/obra.types'

export const useObrasStore = defineStore('obras', () => {
  // Estado
  const obras = ref<Obra[]>([])
  const selectedObra = ref<Obra | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref<PaginationMeta | null>(null)
  const filters = ref<Record<string, string>>({})
  const sortBy = ref<string>('id')
  const sortDirection = ref<'asc' | 'desc'>('desc')

  // Getters
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)
  const getObras = computed(() => obras.value)
  const getPagination = computed(() => pagination.value)
  const getSelectedObra = computed(() => selectedObra.value)
  const getFilters = computed(() => filters.value)
  const getSortBy = computed(() => sortBy.value)
  const getSortDirection = computed(() => sortDirection.value)

  // Actions
  const fetchObras = async (
    page: number = 1, 
    itemsPerPage: number = 15, 
    filters?: Record<string, string>, 
    sort?: { sortBy: string; direction: 'asc' | 'desc' },
    clienteId?: number
  ) => {
    loading.value = true
    error.value = null

    try {
      const params: GetObrasParams = {
        page,
        per_page: itemsPerPage
      }

      // Adicionar filtros se fornecidos
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            params[`filter[${key}]`] = value
          }
        })
      }

      // Adicionar cliente_id se fornecido
      if (clienteId) {
        params['filter[cliente_id]'] = clienteId
      }

      // Adicionar ordenação se fornecida
      if (sort) {
        params.sort = sort.sortBy
        params.order = sort.direction
      }

      const response = await obrasService.getObras(params)
      obras.value = response.data
      pagination.value = response.meta
    } catch (err: any) {
      console.error('Erro ao buscar obras:', err)
      error.value = err.response?.data?.message || 'Erro ao buscar obras'
    } finally {
      loading.value = false
    }
  }

  const fetchObra = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const obra = await obrasService.getObra(id)
      selectedObra.value = obra
      return obra
    } catch (err: any) {
      console.error(`Erro ao buscar obra ${id}:`, err)
      error.value = err.response?.data?.message || `Erro ao buscar obra ${id}`
      return null
    } finally {
      loading.value = false
    }
  }

  const createObra = async (obraData: ObraForm) => {
    loading.value = true
    error.value = null

    try {
      const obra = await obrasService.createObra(obraData)
      // Atualizar a lista de obras se necessário
      if (obras.value.length > 0) {
        fetchObras()
      }
      return obra
    } catch (err: any) {
      console.error('Erro ao criar obra:', err)
      error.value = err.response?.data?.message || 'Erro ao criar obra'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateObra = async (id: number, obraData: ObraForm) => {
    loading.value = true
    error.value = null

    try {
      const obra = await obrasService.updateObra(id, obraData)
      
      // Atualizar a obra na lista se ela existir
      const index = obras.value.findIndex(o => o.id === id)
      if (index !== -1) {
        obras.value[index] = obra
      }
      
      // Atualizar a obra selecionada se for a mesma
      if (selectedObra.value && selectedObra.value.id === id) {
        selectedObra.value = obra
      }
      
      return obra
    } catch (err: any) {
      console.error(`Erro ao atualizar obra ${id}:`, err)
      error.value = err.response?.data?.message || `Erro ao atualizar obra ${id}`
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteObra = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const result = await obrasService.deleteObra(id)
      
      // Remover a obra da lista
      obras.value = obras.value.filter(o => o.id !== id)
      
      // Limpar a obra selecionada se for a mesma
      if (selectedObra.value && selectedObra.value.id === id) {
        selectedObra.value = null
      }
      
      return result
    } catch (err: any) {
      console.error(`Erro ao excluir obra ${id}:`, err)
      error.value = err.response?.data?.message || `Erro ao excluir obra ${id}`
      return null
    } finally {
      loading.value = false
    }
  }

  const toggleObraStatus = async (id: number, ativo: boolean) => {
    loading.value = true
    error.value = null

    try {
      const obra = await obrasService.toggleObraStatus(id, ativo)
      
      // Atualizar a obra na lista se ela existir
      const index = obras.value.findIndex(o => o.id === id)
      if (index !== -1) {
        obras.value[index] = obra
      }
      
      // Atualizar a obra selecionada se for a mesma
      if (selectedObra.value && selectedObra.value.id === id) {
        selectedObra.value = obra
      }
      
      return obra
    } catch (err: any) {
      console.error(`Erro ao alterar status da obra ${id}:`, err)
      error.value = err.response?.data?.message || `Erro ao alterar status da obra ${id}`
      return null
    } finally {
      loading.value = false
    }
  }

  const setFilters = (newFilters: Record<string, string>) => {
    filters.value = newFilters
  }

  const clearFilters = () => {
    filters.value = {}
  }

  const setSorting = (field: string) => {
    if (sortBy.value === field) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortBy.value = field
      sortDirection.value = 'asc'
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // Estado
    obras,
    selectedObra,
    loading,
    error,
    pagination,
    filters,
    sortBy,
    sortDirection,
    
    // Getters
    isLoading,
    hasError,
    getObras,
    getPagination,
    getSelectedObra,
    getFilters,
    getSortBy,
    getSortDirection,
    
    // Actions
    fetchObras,
    fetchObra,
    createObra,
    updateObra,
    deleteObra,
    toggleObraStatus,
    setFilters,
    clearFilters,
    setSorting,
    clearError
  }
})
