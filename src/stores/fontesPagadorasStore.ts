import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import type { FontePagadora, PaginationLinks } from '@/types/fontePagadora.types'
import { fontesPagadorasService } from '@/services/fontesPagadorasService'

type SortDirection = 'asc' | 'desc'

export const useFontesPagadorasStore = defineStore('fontesPagadoras', () => {
  const fontesPagadoras = ref<FontePagadora[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const lastPage = ref(1)
  const perPage = ref(15)
  const total = ref(0)
  const paginationLinks = ref<PaginationLinks | null>(null)
  const activeFilters = reactive<Record<string, string>>({})
  const sortBy = ref<string>('id')
  const sortDirection = ref<SortDirection>('asc')

  const fetchFontesPagadoras = async (
    page: number = 1, 
    itemsPerPage: number = 15, 
    filters?: Record<string, string>,
    sort?: { sortBy: string; direction: SortDirection },
    clienteId?: number
  ) => {
    loading.value = true
    error.value = null
    
    try {
      if (filters) {
        Object.keys(activeFilters).forEach(key => {
          delete activeFilters[key]
        })
        
        // Adicionar novos filtros
        Object.entries(filters).forEach(([key, value]) => {
          activeFilters[key] = value
        })
      }
      
      // Se ordenação foi fornecida, atualize os parâmetros de ordenação
      if (sort) {
        sortBy.value = sort.sortBy
        sortDirection.value = sort.direction
      }
      
      // Preparar parâmetros para a requisição
      const params: {
        page: number;
        per_page: number;
        filter?: Record<string, string | number>;
        sort_by?: string;
        direction?: SortDirection;
      } = {
        page,
        per_page: itemsPerPage,
        sort_by: sortBy.value,
        direction: sortDirection.value
      }
      
      // Adicionar filtros à requisição se houver filtros ativos
      if (Object.keys(activeFilters).length > 0) {
        params.filter = { ...activeFilters }
      }
      
      // Se clienteId foi fornecido, adicione ao filtro
      if (clienteId) {
        if (!params.filter) {
          params.filter = {}
        }
        params.filter['cliente_id'] = clienteId
      }
      
      const response = await fontesPagadorasService.getFontesPagadoras(params)
      
      if (response && response.data) {
        fontesPagadoras.value = response.data
        
        if (response.meta) {
          currentPage.value = response.meta.current_page
          lastPage.value = response.meta.last_page
          perPage.value = response.meta.per_page
          total.value = response.meta.total
        }
        
        if (response.links) {
          paginationLinks.value = response.links
        }
      } else {
        console.error('Store: Unexpected response format:', response)
      }
    } catch (err) {
      error.value = 'Erro ao carregar fontes pagadoras. Tente novamente.'
      console.error('Store error:', err)
    } finally {
      loading.value = false
    }
  }

  const clearFilters = async (clienteId?: number) => {
    Object.keys(activeFilters).forEach(key => {
      delete activeFilters[key]
    })
    
    await fetchFontesPagadoras(1, perPage.value, undefined, undefined, clienteId)
  }

  const createFontePagadora = async (fontePagadoraData: Partial<FontePagadora>) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fontesPagadorasService.createFontePagadora(fontePagadoraData)
      
      const clienteId = fontePagadoraData.cliente_id
      await fetchFontesPagadoras(currentPage.value, perPage.value, undefined, undefined, clienteId)
      
      return response
    } catch (err) {
      error.value = 'Erro ao criar fonte pagadora. Tente novamente.'
      console.error('Store error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateFontePagadora = async (id: number, fontePagadoraData: Partial<FontePagadora>) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fontesPagadorasService.updateFontePagadora(id, fontePagadoraData)
      
      const clienteId = fontePagadoraData.cliente_id
      await fetchFontesPagadoras(currentPage.value, perPage.value, undefined, undefined, clienteId)
      
      return response
    } catch (err) {
      error.value = 'Erro ao atualizar fonte pagadora. Tente novamente.'
      console.error('Store error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteFontePagadora = async (id: number, clienteId?: number) => {
    loading.value = true
    error.value = null
    
    try {
      await fontesPagadorasService.deleteFontePagadora(id)
      
      // Recarregar a lista para refletir a exclusão
      await fetchFontesPagadoras(currentPage.value, perPage.value, undefined, undefined, clienteId)
    } catch (err) {
      error.value = 'Erro ao excluir fonte pagadora. Tente novamente.'
      console.error('Store error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateFontePagadoraStatus = async (id: number, status: 'ativo' | 'inativo', clienteId?: number) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fontesPagadorasService.updateFontePagadoraStatus(id, status)
      
      // Atualizar o item na lista local
      const index = fontesPagadoras.value.findIndex(item => item.id === id)
      if (index !== -1) {
        fontesPagadoras.value[index] = response
      }
      
      return response
    } catch (err) {
      error.value = 'Erro ao alterar status da fonte pagadora. Tente novamente.'
      console.error('Store error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    fontesPagadoras,
    loading,
    error,
    currentPage,
    lastPage,
    perPage,
    total,
    paginationLinks,
    activeFilters,
    sortBy,
    sortDirection,
    fetchFontesPagadoras,
    clearFilters,
    createFontePagadora,
    updateFontePagadora,
    deleteFontePagadora,
    updateFontePagadoraStatus,
    clearError
  }
})
