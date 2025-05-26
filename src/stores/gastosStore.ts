import { defineStore } from 'pinia';
import type { Gasto, GastoForm, GastoFilter, PaginatedResponse, PaginationLinks, PaginationMeta } from '@/types/gasto.types';
import {
  getGastos,
  getGastoById,
  createGasto,
  updateGasto,
  deleteGasto,
  type GetGastosParams
} from '@/services/gastosService';

interface State {
  gastos: Gasto[];
  gasto?: Gasto | null;
  loading: boolean;
  error: string | null;
  pagination: PaginationMeta | null;
  links: PaginationLinks | null;
  filters: GastoFilter;
  sort: string;
  direction: 'asc' | 'desc';
}

export const useGastosStore = defineStore('gastos', {
  state: (): State => ({
    gastos: [],
    gasto: null,
    loading: false,
    error: null,
    pagination: null,
    links: null,
    filters: {},
    sort: 'created_at',
    direction: 'desc',
  }),
  getters: {
    gastosList: (state) => state.gastos,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    getPagination: (state) => state.pagination,
    getLinks: (state) => state.links,
    getFilters: (state) => state.filters,
    getSort: (state) => state.sort,
    getDirection: (state) => state.direction,
    gastoDetail: (state) => state.gasto,
  },
  actions: {
    async fetchGastos(params: Partial<GetGastosParams> = {}) {
      this.loading = true;
      this.error = null;
      try {
        const response = await getGastos({
          ...this.filters,
          sort: this.sort,
          direction: this.direction,
          ...params,
        });
        this.gastos = response.data;
        this.pagination = response.meta;
        this.links = response.links;
      } catch (e: any) {
        this.error = e?.message || 'Erro ao buscar gastos';
      } finally {
        this.loading = false;
      }
    },
    async fetchGasto(id: number) {
      this.loading = true;
      this.error = null;
      try {
        const response = await getGastoById(id);
        this.gasto = response;
        return response; // Retorna os dados para o componente
      } catch (e: any) {
        this.error = e?.message || 'Erro ao buscar gasto';
        throw e; // Propaga o erro para o componente
      } finally {
        this.loading = false;
      }
    },
    async createGasto(payload: Partial<GastoForm>) {
      this.loading = true;
      this.error = null;
      try {
        const gasto = await createGasto(payload);
        await this.fetchGastos();
        return gasto;
      } catch (e: any) {
        this.error = e?.message || 'Erro ao criar gasto';
        throw e;
      } finally {
        this.loading = false;
      }
    },
    async updateGasto(id: number, payload: Partial<GastoForm>) {
      this.loading = true;
      this.error = null;
      try {
        const gasto = await updateGasto(id, payload);
        await this.fetchGastos();
        return gasto;
      } catch (e: any) {
        this.error = e?.message || 'Erro ao atualizar gasto';
        throw e;
      } finally {
        this.loading = false;
      }
    },
    async deleteGasto(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await deleteGasto(id);
        await this.fetchGastos();
      } catch (e: any) {
        this.error = e?.message || 'Erro ao excluir gasto';
        throw e;
      } finally {
        this.loading = false;
      }
    },
    setFilters(filters: GastoFilter) {
      this.filters = { ...filters };
    },
    setSort(sort: string, direction: 'asc' | 'desc') {
      this.sort = sort;
      this.direction = direction;
    },
    clearError() {
      this.error = null;
    },
    clearGasto() {
      this.gasto = null;
    },
  },
});
