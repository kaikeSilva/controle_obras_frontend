import api from '@/services/api';
import type {
  Gasto,
  GastoForm,
  GastoFilter,
  PaginatedResponse
} from '@/types/gasto.types';

export interface GetGastosParams extends GastoFilter {
  page?: number;
  per_page?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export async function getGastos(params: GetGastosParams = {}): Promise<PaginatedResponse<Gasto>> {
  try {
    // Construir os parâmetros da query manualmente para lidar com arrays
    const urlParams = new URLSearchParams();
    
    // Adicionar parâmetros simples
    if (params.page) urlParams.append('page', params.page.toString());
    if (params.per_page) urlParams.append('per_page', params.per_page.toString());
    if (params.sort) urlParams.append('sort', params.sort);
    if (params.direction) urlParams.append('direction', params.direction);
    if (params.search) urlParams.append('search', params.search);
    if (params.obra_id) urlParams.append('obra_id', params.obra_id.toString());
    if (params.categoria_gasto_id) urlParams.append('categoria_gasto_id', params.categoria_gasto_id.toString());
    if (params.fonte_pagadora_id) urlParams.append('fonte_pagadora_id', params.fonte_pagadora_id.toString());
    if (params.data_compra) urlParams.append('data_compra', params.data_compra);
    if (params.data_pagamento) urlParams.append('data_pagamento', params.data_pagamento);
    if (params.data_inicio) urlParams.append('data_inicio', params.data_inicio);
    if (params.data_fim) urlParams.append('data_fim', params.data_fim);
    
    // Adicionar arrays de parâmetros
    if (params.categorias_gasto && params.categorias_gasto.length > 0) {
      params.categorias_gasto.forEach(id => {
        urlParams.append('categorias_gasto[]', id.toString());
      });
    }
    
    // Adicionar array de obras
    if (params.obras && params.obras.length > 0) {
      params.obras.forEach(id => {
        urlParams.append('obras[]', id.toString());
      });
    }
    
    // Fazer a requisição com os parâmetros construídos
    const { data } = await api.get(`/gastos?${urlParams.toString()}`);
    return data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
}

export async function getGastoById(id: number): Promise<Gasto> {
  try {
    const response = await api.get(`/gastos/${id}`);
    
    if (response.data && response.data.data) {
      return response.data;
    }
    
    return response.data;
  } catch (error: any) {
    console.error(`Erro ao buscar gasto com ID ${id}:`, error);
    throw error.response?.data || error;
  }
}

export async function createGasto(payload: Partial<GastoForm>): Promise<Gasto> {
  try {
    const { data } = await api.post('/gastos', payload);
    return data.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
}

export async function updateGasto(id: number, payload: Partial<GastoForm>): Promise<Gasto> {
  try {
    const { data } = await api.put(`/gastos/${id}`, payload);
    return data.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
}

export async function deleteGasto(id: number): Promise<{ message: string }> {
  try {
    const { data } = await api.delete(`/gastos/${id}`);
    return data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
}
