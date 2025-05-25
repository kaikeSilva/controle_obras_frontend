import api from './api'
import type { AutocompleteItem, PaginatedResponse } from '@/types/autocomplete.types'

/**
 * Serviço para buscar dados de autocomplete
 */
export const autocompleteService = {
  /**
   * Busca fontes pagadoras para autocomplete
   */
  async getFontesPagadoras(): Promise<PaginatedResponse<AutocompleteItem>> {
    const response = await api.get('/autocomplete/fontes-pagadoras')
    return response.data
  },

  /**
   * Busca obras para autocomplete
   * @param clienteId ID do cliente para filtrar as obras
   */
  async getObras(clienteId?: number): Promise<PaginatedResponse<AutocompleteItem>> {
    const params = clienteId ? { cliente_id: clienteId } : {}
    const response = await api.get('/autocomplete/obras', { params })
    return response.data
  }
}
