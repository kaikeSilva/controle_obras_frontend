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
    const { data } = await api.get('/gastos', { params });
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
