/**
 * Interface para itens de autocomplete genéricos
 */
export interface AutocompleteItem {
  id: number
  nome: string
}

/**
 * Interface para resposta paginada da API
 */
export interface PaginatedResponse<T> {
  data: T[]
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number
    last_page: number
    links: Array<{
      url: string | null
      label: string
      active: boolean
    }>
    path: string
    per_page: number
    to: number
    total: number
  }
}
