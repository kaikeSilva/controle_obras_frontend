import api from '@/services/api'
import type { DashboardData, DashboardFiltros } from '@/types/dashboard.types'

export const dashboardService = {
  /**
   * Busca os dados do dashboard com base nos filtros fornecidos
   * @param filtros Filtros a serem aplicados na busca
   * @returns Dados do dashboard
   */
  async getDashboardData(filtros: DashboardFiltros): Promise<DashboardData> {
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
      
      const response = await api.get<DashboardData>(`/dashboard`, { params })
      // Retorna apenas o conteúdo da propriedade 'data' da resposta, conforme a estrutura da API
      return response.data
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error)
      throw error
    }
  }
}
