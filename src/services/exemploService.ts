import api from './api'
import type { PaginatedResponse, PaginationParams, SortingParams } from '@/types/api.types'
import type { 
  Exemplo, 
  ExemploFilter, 
  ExemploAutocompleteItem
} from '@/types/exemplo.types'

/**
 * Serviço para operações de API relacionadas a Exemplos
 */
export const exemploService = {
  /**
   * Busca lista paginada de exemplos com filtros opcionais
   */
  async getExemplos(params: PaginationParams & SortingParams): Promise<PaginatedResponse<Exemplo>> {
    try {
      const response = await api.get('/exemplos', { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Busca uma obra específica pelo ID
   */
  async getExemplo(id: number): Promise<Exemplo> {
    try {
      const response = await api.get(`/exemplos/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Cria uma nova obra
   */
  async createExemplo(exemplo: Exemplo): Promise<Exemplo> {
    try {
      const response = await api.post('/exemplos', exemplo)
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Atualiza uma obra existente
   */
  async updateExemplo(id: number, exemplo: Exemplo): Promise<Exemplo> {
    try {
      const response = await api.put(`/exemplos/${id}`, exemplo)
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Remove (soft delete) uma obra
   */
  async deleteExemplo(id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/exemplos/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Busca obras para autocomplete
   */
  async getExemplosAutocomplete(): Promise<ExemploAutocompleteItem[]> {
    try {
      const response = await api.get<ExemploAutocompleteItem[]>('/autocomplete/exemplos')
      return response.data
    } catch (error) {
      return []
    }
  },

}
