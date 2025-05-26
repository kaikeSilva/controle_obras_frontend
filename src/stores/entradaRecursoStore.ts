import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { entradaRecursoService, type GetEntradasRecursosParams } from '@/services/entradaRecursoService'
import type { EntradaRecurso, EntradaRecursoForm, PaginationMeta } from '@/types/entrada-recurso.types'

export const useEntradaRecursoStore = defineStore('entradaRecurso', () => {
  // Estado
  const entradasRecursos = ref<EntradaRecurso[]>([])
  const selectedEntradaRecurso = ref<EntradaRecurso | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref<PaginationMeta | null>(null)
  const filters = ref<Record<string, string | number>>({})
  const sortBy = ref<string>('id')
  const sortDirection = ref<'asc' | 'desc'>('desc')

  // Getters
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)
  const getEntradasRecursos = computed(() => entradasRecursos.value)
  const getPagination = computed(() => pagination.value)
  const getSelectedEntradaRecurso = computed(() => selectedEntradaRecurso.value)
  const getFilters = computed(() => filters.value)
  const getSortBy = computed(() => sortBy.value)
  const getSortDirection = computed(() => sortDirection.value)

  // Actions
  const fetchEntradasRecursos = async (
    page: number = 1, 
    itemsPerPage: number = 15, 
    filters?: Record<string, string | number>, 
    sort?: { sortBy: string; direction: 'asc' | 'desc' },
    obraId?: number
  ) => {
    loading.value = true
    error.value = null

    try {
      const params: GetEntradasRecursosParams = {
        page,
        per_page: itemsPerPage
      }

      // Adicionar filtros se fornecidos
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params[`filter[${key}]`] = value
          }
        })
      }

      // Adicionar obra_id se fornecido
      if (obraId) {
        params['filter[obra_id]'] = obraId
      }

      // Adicionar ordenação se fornecida
      if (sort) {
        params.sort = sort.sortBy
        params.order = sort.direction
      }

      const response = await entradaRecursoService.getEntradasRecursos(params)
      entradasRecursos.value = response.data
      pagination.value = response.meta
    } catch (err: any) {
      console.error('Erro ao buscar entradas de recursos:', err)
      error.value = err.response?.data?.message || 'Erro ao buscar entradas de recursos'
    } finally {
      loading.value = false
    }
  }

  const fetchEntradaRecursoById = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const entradaRecurso = await entradaRecursoService.getEntradaRecursoById(id)
      selectedEntradaRecurso.value = entradaRecurso
      return entradaRecurso
    } catch (err: any) {
      console.error(`Erro ao buscar entrada de recurso ${id}:`, err)
      error.value = err.response?.data?.message || `Erro ao buscar entrada de recurso ${id}`
      return null
    } finally {
      loading.value = false
    }
  }

  const createEntradaRecurso = async (entradaRecursoData: EntradaRecursoForm) => {
    loading.value = true
    error.value = null

    try {
      const entradaRecurso = await entradaRecursoService.createEntradaRecurso(entradaRecursoData)
      // Atualizar a lista de entradas de recursos se necessário
      if (entradasRecursos.value.length > 0) {
        fetchEntradasRecursos()
      }
      return entradaRecurso
    } catch (err: any) {
      console.error('Erro ao criar entrada de recurso:', err)
      error.value = err.response?.data?.message || 'Erro ao criar entrada de recurso'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateEntradaRecurso = async (id: number, entradaRecursoData: Partial<EntradaRecursoForm>) => {
    loading.value = true
    error.value = null

    try {
      const entradaRecurso = await entradaRecursoService.updateEntradaRecurso(id, entradaRecursoData)
      
      // Atualizar a entrada de recurso na lista se ela existir
      const index = entradasRecursos.value.findIndex(e => e.id === id)
      if (index !== -1) {
        entradasRecursos.value[index] = entradaRecurso
      }
      
      // Atualizar a entrada de recurso selecionada se for a mesma
      if (selectedEntradaRecurso.value && selectedEntradaRecurso.value.id === id) {
        selectedEntradaRecurso.value = entradaRecurso
      }
      
      return entradaRecurso
    } catch (err: any) {
      console.error(`Erro ao atualizar entrada de recurso ${id}:`, err)
      error.value = err.response?.data?.message || `Erro ao atualizar entrada de recurso ${id}`
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteEntradaRecurso = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const result = await entradaRecursoService.deleteEntradaRecurso(id)
      
      // Remover a entrada de recurso da lista
      entradasRecursos.value = entradasRecursos.value.filter(e => e.id !== id)
      
      // Limpar a entrada de recurso selecionada se for a mesma
      if (selectedEntradaRecurso.value && selectedEntradaRecurso.value.id === id) {
        selectedEntradaRecurso.value = null
      }
      
      return result
    } catch (err: any) {
      console.error(`Erro ao excluir entrada de recurso ${id}:`, err)
      error.value = err.response?.data?.message || `Erro ao excluir entrada de recurso ${id}`
      return null
    } finally {
      loading.value = false
    }
  }

  const setFilters = (newFilters: Record<string, string | number>) => {
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
    entradasRecursos,
    selectedEntradaRecurso,
    loading,
    error,
    pagination,
    filters,
    sortBy,
    sortDirection,
    
    // Getters
    isLoading,
    hasError,
    getEntradasRecursos,
    getPagination,
    getSelectedEntradaRecurso,
    getFilters,
    getSortBy,
    getSortDirection,
    
    // Actions
    fetchEntradasRecursos,
    fetchEntradaRecursoById,
    createEntradaRecurso,
    updateEntradaRecurso,
    deleteEntradaRecurso,
    setFilters,
    clearFilters,
    setSorting,
    clearError
  }
})
