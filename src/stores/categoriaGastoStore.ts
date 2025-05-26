import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { categoriasGastosService } from '@/services/categoriasGastosService'
import type { CategoriaGasto, CategoriaGastoFilter, PaginatedResponse, PaginationMeta } from '@/types/categoriaGasto.types'

export const useCategoriaGastoStore = defineStore('categoriaGasto', () => {
  // Estado
  const categoriasGastos = ref<CategoriaGasto[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref<PaginationMeta | null>(null)
  const filters = ref<CategoriaGastoFilter>({})
  const sortBy = ref('nome')
  const sortDirection = ref<'asc' | 'desc'>('asc')

  // Getters
  const getCategoriasGastos = computed(() => categoriasGastos.value)
  const isLoading = computed(() => loading.value)
  const getError = computed(() => error.value)
  const getPagination = computed(() => pagination.value)
  const getFilters = computed(() => filters.value)
  const getSortBy = computed(() => sortBy.value)
  const getSortDirection = computed(() => sortDirection.value)

  // Actions
  const fetchCategoriasGastos = async (
    page = 1,
    perPage = 15,
    filterParams: CategoriaGastoFilter = {},
    sortParams = { sortBy: 'nome', direction: 'asc' as 'asc' | 'desc' },
    clienteId?: number
  ) => {
    loading.value = true
    error.value = null

    try {
      // Mesclar filtros existentes com novos filtros
      const mergedFilters = { ...filters.value, ...filterParams }
      
      // Adicionar cliente_id ao filtro se fornecido
      if (clienteId !== undefined) {
        mergedFilters.cliente_id = clienteId
      }

      const response = await categoriasGastosService.getCategoriasGastos({
        page,
        per_page: perPage,
        sort_by: sortParams.sortBy,
        direction: sortParams.direction,
        filter: mergedFilters
      })

      categoriasGastos.value = response.data
      pagination.value = response.meta
    } catch (err) {
      console.error('Erro ao buscar categorias de gastos:', err)
      error.value = err instanceof Error ? err.message : 'Erro ao carregar categorias de gastos'
      categoriasGastos.value = []
    } finally {
      loading.value = false
    }
  }

  const getCategoriaGastoById = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const response = await categoriasGastosService.getCategoriaGastoById(id)
      return response
    } catch (err) {
      console.error(`Erro ao buscar categoria de gasto com ID ${id}:`, err)
      error.value = err instanceof Error ? err.message : `Erro ao carregar categoria de gasto com ID ${id}`
      throw err
    } finally {
      loading.value = false
    }
  }

  const createCategoriaGasto = async (data: Partial<CategoriaGasto>) => {
    loading.value = true
    error.value = null

    try {
      const response = await categoriasGastosService.createCategoriaGasto(data)
      return response
    } catch (err) {
      console.error('Erro ao criar categoria de gasto:', err)
      error.value = err instanceof Error ? err.message : 'Erro ao criar categoria de gasto'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateCategoriaGasto = async (id: number, data: Partial<CategoriaGasto>) => {
    loading.value = true
    error.value = null

    try {
      const response = await categoriasGastosService.updateCategoriaGasto(id, data)
      return response
    } catch (err) {
      console.error(`Erro ao atualizar categoria de gasto com ID ${id}:`, err)
      error.value = err instanceof Error ? err.message : `Erro ao atualizar categoria de gasto com ID ${id}`
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteCategoriaGasto = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      await categoriasGastosService.deleteCategoriaGasto(id)
      // Remover a categoria excluída do estado local
      categoriasGastos.value = categoriasGastos.value.filter(categoria => categoria.id !== id)
    } catch (err) {
      console.error(`Erro ao excluir categoria de gasto com ID ${id}:`, err)
      error.value = err instanceof Error ? err.message : `Erro ao excluir categoria de gasto com ID ${id}`
      throw err
    } finally {
      loading.value = false
    }
  }

  const setFilters = (newFilters: CategoriaGastoFilter) => {
    filters.value = { ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {}
  }

  const setSorting = (field: string) => {
    if (sortBy.value === field) {
      // Inverter direção se o campo já estiver selecionado
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      // Definir novo campo e resetar direção para 'asc'
      sortBy.value = field
      sortDirection.value = 'asc'
    }
  }

  const clearError = () => {
    error.value = null
  }

  // Alias para compatibilidade com outros componentes
  const fetchCategoriaGasto = getCategoriaGastoById

  return {
    // Estado
    categoriasGastos,
    loading,
    error,
    pagination,
    filters,
    sortBy,
    sortDirection,
    
    // Getters
    getCategoriasGastos,
    isLoading,
    getError,
    getPagination,
    getFilters,
    getSortBy,
    getSortDirection,
    
    // Actions
    fetchCategoriasGastos,
    getCategoriaGastoById,
    fetchCategoriaGasto, // Alias para getCategoriaGastoById para compatibilidade
    createCategoriaGasto,
    updateCategoriaGasto,
    deleteCategoriaGasto,
    setFilters,
    clearFilters,
    setSorting,
    clearError
  }
})
