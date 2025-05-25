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
      console.log('Fetching fontes pagadoras from API with params:', params)
      
      // Usando endpoint direto conforme a documentação da API
      const response = await api.get('/fonte-pagadoras', { params })
      
      console.log('Fontes pagadoras data received:', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching fontes pagadoras:', error)
      throw error
    }
  },
  
  async getFontePagadoraById(id: number): Promise<FontePagadora> {
    try {
      console.log(`Buscando fonte pagadora com ID: ${id}`)
      const response = await api.get(`/fonte-pagadoras/${id}`)
      
      // A API retorna os dados dentro de um objeto 'data'
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
      console.log('Creating new fonte pagadora:', fontePagadoraData)
      const response = await api.post('/fonte-pagadoras', fontePagadoraData)
      
      console.log('Fonte pagadora created:', response.data)
      return response.data
    } catch (error) {
      console.error('Error creating fonte pagadora:', error)
      throw error
    }
  },
  
  async updateFontePagadora(id: number, fontePagadoraData: Partial<FontePagadora>): Promise<FontePagadora> {
    try {
      console.log(`Updating fonte pagadora with ID ${id}:`, fontePagadoraData)
      const response = await api.put(`/fonte-pagadoras/${id}`, fontePagadoraData)
      
      // A API retorna os dados dentro de um objeto 'data'
      if (response.data && response.data.data) {
        console.log('Fonte pagadora updated:', response.data.data)
        return response.data.data
      }
      
      console.log('Fonte pagadora updated:', response.data)
      return response.data
    } catch (error) {
      console.error(`Error updating fonte pagadora with ID ${id}:`, error)
      throw error
    }
  },
  
  async deleteFontePagadora(id: number): Promise<void> {
    try {
      console.log(`Deleting fonte pagadora with ID ${id}`)
      await api.delete(`/fonte-pagadoras/${id}`)
      console.log(`Fonte pagadora with ID ${id} deleted successfully`)
    } catch (error) {
      console.error(`Error deleting fonte pagadora with ID ${id}:`, error)
      throw error
    }
  },
  
  async updateFontePagadoraStatus(id: number, status: 'ativo' | 'inativo'): Promise<FontePagadora> {
    try {
      console.log(`Updating status of fonte pagadora with ID ${id} to ${status}`)
      const response = await api.put(`/fonte-pagadoras/${id}`, { status })
      
      if (response.data && response.data.data) {
        console.log('Fonte pagadora status updated:', response.data.data)
        return response.data.data
      }
      
      console.log('Fonte pagadora status updated:', response.data)
      return response.data
    } catch (error) {
      console.error(`Error updating status of fonte pagadora with ID ${id}:`, error)
      throw error
    }
  }
}
