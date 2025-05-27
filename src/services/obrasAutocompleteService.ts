import api from './api'

export interface ObraAutocomplete {
  id: number
  nome: string
}

export interface ObrasAutocompleteResponse {
  data: ObraAutocomplete[]
}

export const obrasAutocompleteService = {
  /**
   * Busca obras para autocomplete
   */
  async getObrasAutocomplete(): Promise<ObraAutocomplete[]> {
    try {
      const response = await api.get<ObrasAutocompleteResponse>('/autocomplete/obras')
      return response.data.data || []
    } catch (error) {
      console.error('Erro ao buscar obras para autocomplete:', error)
      return []
    }
  }
}
