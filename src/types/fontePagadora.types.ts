export interface FontePagadora {
  id: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  data_cadastro: string;
  cliente_id: number;
  status: 'ativo' | 'inativo';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface FontePagadoraForm {
  nome: string;
  descricao: string | null;
  ativo: boolean;
  cliente_id: number;
  status: 'ativo' | 'inativo';
}

export interface FontePagadoraFilter {
  nome?: string;
  descricao?: string;
  status?: 'ativo' | 'inativo';
  cliente_id?: number;
  busca?: string;
  data_cadastro?: string;
}

// Reutilizando os tipos de paginação existentes
import type { PaginationLinks, PaginationMeta, PaginatedResponse } from '@/types/client.types';

export interface FontesPagadorasState {
  fontesPagadoras: FontePagadora[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    links: PaginationLinks;
  } | null;
}

// Exportando os tipos de paginação para reutilização
export type { PaginationLinks, PaginationMeta, PaginatedResponse };
