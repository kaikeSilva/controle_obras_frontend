import api from '@/services/api'
import type { DashboardFiltros } from '@/types/dashboard.types'

export interface PdfReportResponse {
  message: string
  job_id: string
  filename: string
  status: string
  websocket_channel: string
}

export const pdfReportService = {
  /**
   * Solicitar geração de relatório PDF via WebSocket
   */
  async solicitarRelatorioPDF(filtros: DashboardFiltros): Promise<PdfReportResponse> {
    try {
      console.log('[PDF Service] Solicitando relatório com filtros:', filtros)
      
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
      
      const response = await api.get<PdfReportResponse>('/relatorios/gastos', { 
        params
      })
      console.log('[PDF Service] Resposta da API:', response.data)
      return response.data
    } catch (error) {
      console.error('Erro ao solicitar relatório PDF:', error)
      throw error
    }
  },

  /**
   * Cancelar geração de relatório
   */
  async cancelarRelatorio(jobId: string): Promise<{ message: string }> {
    try {
      console.log('[PDF Service] Cancelando relatório:', jobId)
      const response = await api.delete(`/relatorios/cancelar/${jobId}`)
      console.log('[PDF Service] Resposta do cancelamento:', response.data)
      return response.data
    } catch (error) {
      console.error('Erro ao cancelar relatório:', error)
      throw error
    }
  },

  /**
   * Verificar status (fallback)
   */
  async verificarStatus(jobId: string): Promise<any> {
    try {
      console.log('[PDF Service] Verificando status do relatório:', jobId)
      const response = await api.get(`/relatorios/status/${jobId}`)
      console.log('[PDF Service] Status do relatório:', response.data)
      return response.data
    } catch (error) {
      console.error('Erro ao verificar status:', error)
      throw error
    }
  },
  
  /**
   * Obter URL de download do relatório
   */
  getDownloadUrl(filename: string): string {
    return `${api.defaults.baseURL}/relatorios/download/${filename}`
  }
}
