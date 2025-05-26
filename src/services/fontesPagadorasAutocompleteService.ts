import api from './api'

export interface FontePagadoraAutocomplete {
  id: number
  nome: string
}

export interface FontesPagadorasAutocompleteResponse {
  data: FontePagadoraAutocomplete[]
}

export const fontesPagadorasAutocompleteService = {
  /**
   * Busca fontes pagadoras para autocomplete
   */
  async getFontesPagadorasAutocomplete(): Promise<FontePagadoraAutocomplete[]> {
    try {
      console.log('Chamando API endpoint: /autocomplete/fontes-pagadoras')
      const response = await api.get<FontesPagadorasAutocompleteResponse>('/autocomplete/fontes-pagadoras')
      console.log('Resposta da API de autocomplete de fontes pagadoras:', response)
      return response.data.data || []
    } catch (error) {
      console.error('Erro ao buscar fontes pagadoras para autocomplete:', error)
      return []
    }
  }
}
