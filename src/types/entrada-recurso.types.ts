/**
 * Interface para a entidade EntradaRecurso
 */
export interface EntradaRecurso {
  id: number
  obra_id: number
  obra?: {
    id: number
    nome: string
  }
  fonte_pagadora_id: number
  fonte_pagadora?: {
    id: number
    nome: string
  }
  valor: number
  valor_formatado?: string
  data_entrada: string
  data_entrada_formatada?: string
  descricao: string
  comprovante_url?: string | null
  tipo_entrada: 'aporte_inicial' | 'aporte_adicional' | 'reembolso' | 'regular'
  tipo_entrada_formatado?: string
  created_at?: string
  created_at_formatado?: string
  updated_at?: string
  updated_at_formatado?: string
  deleted_at?: string | null
  deleted_at_formatado?: string | null
}

/**
 * Interface para o formulário de criação/edição de EntradaRecurso
 */
export interface EntradaRecursoForm {
  obra_id: number
  fonte_pagadora_id: number
  valor: number
  data_entrada: string
  descricao: string
  comprovante_url?: string | null
  tipo_entrada: 'aporte_inicial' | 'aporte_adicional' | 'reembolso' | 'regular'
}

/**
 * Interface para os filtros de EntradaRecurso
 */
export interface EntradaRecursoFilter {
  search?: string
  obra_id?: number
  fonte_pagadora_id?: number
  tipo_entrada?: string
  data_entrada?: string
  data_inicio?: string
  data_fim?: string
}

/**
 * Interface para a paginação
 */
export interface PaginationLinks {
  first: string
  last: string
  prev: string | null
  next: string | null
}

/**
 * Interface para os metadados de paginação
 */
export interface PaginationMeta {
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

/**
 * Interface para resposta paginada da API
 */
export interface PaginatedResponse<T> {
  data: T[]
  links: PaginationLinks
  meta: PaginationMeta
}

/**
 * Interface para o autocomplete de EntradaRecurso
 */
export interface EntradaRecursoAutocomplete {
  results: Array<{
    id: number
    nome: string
  }>
}
