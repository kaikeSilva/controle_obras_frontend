import api from './api'

export interface CategoriaGastoAutocomplete {
  id: number
  nome: string
}

export interface CategoriasGastosAutocompleteResponse {
  data: CategoriaGastoAutocomplete[]
}

export const categoriasGastosAutocompleteService = {
  /**
   * Busca categorias de gastos para autocomplete
   */
  async getCategoriasGastosAutocomplete(): Promise<CategoriaGastoAutocomplete[]> {
    try {
      console.log('Chamando API endpoint: /autocomplete/categorias-gastos')
      const response = await api.get<CategoriasGastosAutocompleteResponse>('/autocomplete/categorias-gastos')
      console.log('Resposta da API de autocomplete de categorias de gastos:', response)
      return response.data.data || []
    } catch (error) {
      console.error('Erro ao buscar categorias de gastos para autocomplete:', error)
      return []
    }
  }
}
