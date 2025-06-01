export const STATUS = {
  ATIVO: 'ativo',
  INATIVO: 'inativo'
}

export interface Exemplo {
  id: number;
  nome: string;
  status: STATUS;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface ExemploFilter {
  busca?: string;
  status?: STATUS;
  ativo?: boolean;
  exemplos?: number[];
  created_at_inicio?: string;
  created_at_fim?: string;
  updated_at_inicio?: string;
  updated_at_fim?: string;
  deleted_at_inicio?: string;
  deleted_at_fim?: string;
}

export interface ExemploAutocompleteItem {
  id: number;
  nome: string;
}
