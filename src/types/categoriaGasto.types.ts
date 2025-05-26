export interface CategoriaGasto {
  id: number;
  nome: string;
  slug: string;
  status: string;
  cliente_id: number | null;
  cliente?: {
    id: number;
    nome: string;
  } | null;
  descricao: string | null;
  cor: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoriaGastoForm {
  nome: string;
  status: string;
  cliente_id: number | null;
  descricao: string | null;
  cor: string | null;
}

export interface CategoriaGastoFilter {
  busca?: string;
  cliente_id?: number;
  status?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  path: string;
  per_page: number;
  to: number;
  total: number;
}

export interface AutocompleteItem {
  id: number;
  nome: string;
}
