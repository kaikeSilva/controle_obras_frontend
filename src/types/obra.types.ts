/**
 * Interface para o cliente simplificado retornado dentro da obra
 */
export interface ClienteSimplificado {
  id: number
  nome: string
}

/**
 * Interface para a entidade Obra
 */
export interface Obra {
  id: number
  cliente_id: number
  cliente?: ClienteSimplificado
  nome: string
  descricao?: string
  endereco?: string
  area_m2?: number
  data_inicio?: string
  prazo_estimado?: string
  valor_estimado?: number
  taxa_administracao?: number
  status: 'em_andamento' | 'concluida' | 'pausada'
  ativo: boolean
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

/**
 * Interface para o formulário de criação/edição de Obra
 */
export interface ObraForm {
  cliente_id: number
  nome: string
  descricao: string
  endereco: string
  area_m2: number | null
  data_inicio: string
  prazo_estimado: string
  valor_estimado: number | null
  taxa_administracao: number | null
  status: string
  ativo: boolean
}

/**
 * Interface para os filtros de Obra
 */
export interface ObraFilter {
  cliente_id?: number
  search?: string
  status?: string
  ativo?: boolean
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
