import api from './api'
import type { EntradaRecurso, EntradaRecursoForm, EntradaRecursoFilter, PaginatedResponse, EntradaRecursoAutocomplete } from '@/types/entrada-recurso.types'

/**
 * Parâmetros para busca de entradas de recursos
 */
export interface GetEntradasRecursosParams {
  page?: number
  per_page?: number
  'filter[search]'?: string
  'filter[obra_id]'?: number
  'filter[fonte_pagadora_id]'?: number
  'filter[tipo_entrada]'?: string
  'filter[data_entrada]'?: string
  'filter[data_inicio]'?: string
  'filter[data_fim]'?: string
  sort?: string
  order?: string
}

/**
 * Serviço para operações de API relacionadas a Entradas de Recursos
 */
export const entradaRecursoService = {
  /**
   * Busca lista paginada de entradas de recursos com filtros opcionais
   */
  async getEntradasRecursos(params: GetEntradasRecursosParams): Promise<PaginatedResponse<EntradaRecurso>> {
    try {
      const response = await api.get('/entradas-recursos', { params })
      return response.data
    } catch (error) {
      console.error('Erro ao buscar entradas de recursos:', error)
      throw error
    }
  },

  /**
   * Busca uma entrada de recurso específica pelo ID
   */
  async getEntradaRecursoById(id: number): Promise<EntradaRecurso> {
    try {
      const response = await api.get(`/entradas-recursos/${id}`)
      // Considerando a memória que indica que os dados estão aninhados em 'data'
      return response.data.data || response.data
    } catch (error) {
      console.error(`Erro ao buscar entrada de recurso com ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Cria uma nova entrada de recurso
   */
  async createEntradaRecurso(entradaRecurso: EntradaRecursoForm): Promise<EntradaRecurso> {
    try {
      const response = await api.post('/entradas-recursos', entradaRecurso)
      return response.data.data || response.data
    } catch (error) {
      console.error('Erro ao criar entrada de recurso:', error)
      throw error
    }
  },

  /**
   * Atualiza uma entrada de recurso existente
   */
  async updateEntradaRecurso(id: number, entradaRecurso: Partial<EntradaRecursoForm>): Promise<EntradaRecurso> {
    try {
      const response = await api.put(`/entradas-recursos/${id}`, entradaRecurso)
      return response.data.data || response.data
    } catch (error) {
      console.error(`Erro ao atualizar entrada de recurso com ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Remove uma entrada de recurso
   */
  async deleteEntradaRecurso(id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/entradas-recursos/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao excluir entrada de recurso com ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Busca entradas de recursos para autocomplete
   */
  async getEntradaRecursoAutocomplete(
    search?: string,
    obra_id?: number,
    fonte_pagadora_id?: number,
    tipo_entrada?: string
  ): Promise<EntradaRecursoAutocomplete> {
    try {
      const params = {
        search,
        obra_id,
        fonte_pagadora_id,
        tipo_entrada
      }
      
      const response = await api.get('/autocomplete/entradas-recursos', { params })
      return response.data
    } catch (error) {
      console.error('Erro ao buscar autocomplete de entradas de recursos:', error)
      throw error
    }
  }
}
