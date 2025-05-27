import type { FontePagadora, PaginatedResponse } from '@/types/fontePagadora.types'
import api from './api'

interface GetFontesPagadorasParams {
  page?: number;
  per_page?: number;
  filter?: Record<string, string | number>;
  sort_by?: string;
  direction?: 'asc' | 'desc';
}

export const fontesPagadorasService = {
  async getFontesPagadoras(params: GetFontesPagadorasParams): Promise<PaginatedResponse<FontePagadora>> {
    try {
      const response = await api.get('/fonte-pagadoras', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching fontes pagadoras:', error)
      throw error
    }
  },
  
  async getFontePagadoraById(id: number): Promise<FontePagadora> {
    try {
      const response = await api.get(`/fonte-pagadoras/${id}`)
      
      if (response.data && response.data.data) {
        return response.data.data
      }
      
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar fonte pagadora com ID ${id}:`, error)
      throw error
    }
  },
  
  async createFontePagadora(fontePagadoraData: Partial<FontePagadora>): Promise<FontePagadora> {
    try {
      const response = await api.post('/fonte-pagadoras', fontePagadoraData)
      return response.data
    } catch (error) {
      console.error('Error creating fonte pagadora:', error)
      throw error
    }
  },
  
  async updateFontePagadora(id: number, fontePagadoraData: Partial<FontePagadora>): Promise<FontePagadora> {
    try {
      const response = await api.put(`/fonte-pagadoras/${id}`, fontePagadoraData)
      
      if (response.data && response.data.data) {
        return response.data.data
      }
      
      return response.data
    } catch (error) {
      console.error(`Error updating fonte pagadora with ID ${id}:`, error)
      throw error
    }
  },
  
  async deleteFontePagadora(id: number): Promise<void> {
    try {
      await api.delete(`/fonte-pagadoras/${id}`)
    } catch (error) {
      console.error(`Error deleting fonte pagadora with ID ${id}:`, error)
      throw error
    }
  },
  
  async updateFontePagadoraStatus(id: number, status: 'ativo' | 'inativo'): Promise<FontePagadora> {
    try {
      const response = await api.put(`/fonte-pagadoras/${id}`, { status })
      
      if (response.data && response.data.data) {
        return response.data.data
      }
      
      return response.data
    } catch (error) {
      console.error(`Error updating status of fonte pagadora with ID ${id}:`, error)
      throw error
    }
  }
}
