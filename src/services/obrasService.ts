import api from './api'
import type { Obra, ObraForm, ObraFilter, PaginatedResponse } from '@/types/obra.types'
import type { DashboardFiltros } from '@/types/dashboard.types'

/**
 * Parâmetros para busca de obras
 */
export interface GetObrasParams {
  page?: number
  per_page?: number
  'filter[cliente_id]'?: number
  'filter[search]'?: string
  'filter[status]'?: string
  'filter[ativo]'?: boolean
  sort?: string
  order?: string
}

/**
 * Serviço para operações de API relacionadas a Obras
 */
export const obrasService = {
  /**
   * Busca lista paginada de obras com filtros opcionais
   */
  async getObras(params: GetObrasParams): Promise<PaginatedResponse<Obra>> {
    const response = await api.get('/obras', { params })
    return response.data
  },

  /**
   * Busca uma obra específica pelo ID
   */
  async getObra(id: number): Promise<Obra> {
    const response = await api.get(`/obras/${id}`)
    return response.data
  },

  /**
   * Cria uma nova obra
   */
  async createObra(obra: ObraForm): Promise<Obra> {
    const response = await api.post('/obras', obra)
    return response.data
  },

  /**
   * Atualiza uma obra existente
   */
  async updateObra(id: number, obra: ObraForm): Promise<Obra> {
    const response = await api.put(`/obras/${id}`, obra)
    return response.data
  },

  /**
   * Remove (soft delete) uma obra
   */
  async deleteObra(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/obras/${id}`)
    return response.data
  },

  /**
   * Alterna o status ativo/inativo de uma obra
   */
  async toggleObraStatus(id: number, ativo: boolean): Promise<Obra> {
    const response = await api.put(`/obras/${id}`, { ativo })
    return response.data
  },

  /**
   * Gera um relatório PDF de gastos de uma obra
   * @param filtros Filtros para o relatório (mesmos parâmetros do dashboard)
   * @returns Blob contendo o PDF gerado
   */
  async gerarRelatorioPDF(filtros: DashboardFiltros): Promise<Blob> {
    try {
      // Construir os parâmetros da query
      const params = new URLSearchParams()
      
      // Adicionar datas
      params.append('data_inicio', filtros.dataInicio)
      params.append('data_fim', filtros.dataFim)
      
      // Adicionar obras (se houver)
      if (filtros.obras && filtros.obras.length > 0) {
        filtros.obras.forEach(obraId => {
          params.append('obras[]', obraId.toString())
        })
      }
      
      // Adicionar categorias de gasto (se houver)
      if (filtros.categorias_gasto && filtros.categorias_gasto.length > 0) {
        filtros.categorias_gasto.forEach(categoriaId => {
          params.append('categorias_gasto[]', categoriaId.toString())
        })
      }
      
      // Configurar responseType para blob para receber o PDF
      const response = await api.get('/relatorios/gastos', { 
        params,
        responseType: 'blob'
      })
      
      return response.data
    } catch (error) {
      console.error('Erro ao gerar relatório PDF:', error)
      throw error
    }
  }
}
