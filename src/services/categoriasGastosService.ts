import api from './api'
import type { CategoriaGasto, CategoriaGastoForm, PaginatedResponse, AutocompleteItem } from '@/types/categoriaGasto.types'

interface GetCategoriasGastosParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  direction?: 'asc' | 'desc';
  filter?: {
    cliente_id?: number;
    status?: boolean;
    busca?: string;
  };
}

export const categoriasGastosService = {
  /**
   * Busca todas as categorias de gastos com paginação e filtros
   */
  async getCategoriasGastos(params: GetCategoriasGastosParams = {}): Promise<PaginatedResponse<CategoriaGasto>> {
    try {
      const { page, per_page, sort_by, direction, filter } = params
      
      const queryParams: Record<string, any> = {
        page,
        per_page,
        sort_by,
        direction
      }
      
      // Adicionar filtros se existirem
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams[`filter[${key}]`] = value
          }
        })
      }
      
      const response = await api.get('/categorias-gastos', { params: queryParams })
      return response.data
    } catch (error) {
      console.error('Erro ao buscar categorias de gastos:', error)
      throw error
    }
  },
  
  /**
   * Busca uma categoria de gasto pelo ID
   */
  async getCategoriaGastoById(id: number): Promise<CategoriaGasto> {
    try {
      const response = await api.get(`/categorias-gastos/${id}`)
      return response.data.data
    } catch (error) {
      console.error(`Erro ao buscar categoria de gasto com ID ${id}:`, error)
      throw error
    }
  },
  
  /**
   * Cria uma nova categoria de gasto
   */
  async createCategoriaGasto(data: CategoriaGastoForm): Promise<CategoriaGasto> {
    try {
      const response = await api.post('/categorias-gastos', data)
      return response.data
    } catch (error) {
      console.error('Erro ao criar categoria de gasto:', error)
      throw error
    }
  },
  
  /**
   * Atualiza uma categoria de gasto existente
   */
  async updateCategoriaGasto(id: number, data: CategoriaGastoForm): Promise<CategoriaGasto> {
    try {
      const response = await api.put(`/categorias-gastos/${id}`, data)
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar categoria de gasto com ID ${id}:`, error)
      throw error
    }
  },
  
  /**
   * Exclui uma categoria de gasto
   */
  async deleteCategoriaGasto(id: number): Promise<void> {
    try {
      await api.delete(`/categorias-gastos/${id}`)
    } catch (error) {
      console.error(`Erro ao excluir categoria de gasto com ID ${id}:`, error)
      throw error
    }
  },
  
  /**
   * Busca categorias de gastos para autocomplete
   */
  async getCategoriasGastosAutocomplete(search: string = '', cliente_id?: number): Promise<AutocompleteItem[]> {
    try {
      const params: Record<string, any> = { search }
      
      if (cliente_id !== undefined) {
        params.cliente_id = cliente_id
      }
      
      const response = await api.get('/autocomplete/categorias-gastos', { params })
      return response.data
    } catch (error) {
      console.error('Erro ao buscar categorias de gastos para autocomplete:', error)
      throw error
    }
  }
}
