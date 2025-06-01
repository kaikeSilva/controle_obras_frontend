// Tipos para a entidade Gasto

export interface Gasto {
  id: number;
  obra_id: number;
  categoria_gasto_id: number;
  fonte_pagadora_id: number;
  descricao: string;
  valor: number;
  data_compra: string; // YYYY-MM-DD
  data_pagamento?: string | null; // YYYY-MM-DD ou null
  numero_documento?: string | null;
  comprovante_url?: string | null;
  observacoes?: string | null;
  created_at: string; // date-time
  updated_at: string; // date-time
  obra?: {
    id: number;
    nome: string;
  };
  categoria_gasto?: {
    id: number;
    nome: string;
  };
  fonte_pagadora?: {
    id: number;
    nome: string;
  };
}

export interface GastoForm {
  obra_id: number;
  categoria_gasto_id: number;
  fonte_pagadora_id: number;
  descricao: string;
  valor: number;
  data_compra: string;
  data_pagamento?: string | null;
  numero_documento?: string | null;
  comprovante_url?: string | null;
  observacoes?: string | null;
}

export interface GastoFilter {
  search?: string;
  obra_id?: number;
  categoria_gasto_id?: number;
  categorias_gasto?: number[];
  obras?: number[];
  fonte_pagadora_id?: number;
  data_compra?: string;
  data_inicio?: string;
  data_fim?: string;
  data_pagamento?: string;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number;
  to: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}
