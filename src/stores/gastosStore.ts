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
    sort: 'data_pagamento',
    per_page: 10,
    direction: 'asc',
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
    async fetchGastos(params: any = {}) {
      this.loading = true;
      this.error = null;
      try {
        console.log('Filtros para buscar gastos:', this.filters)
        const response = await getGastos({
          ...this.filters,
          sort: this.sort,
          direction: this.direction,
          per_page: this.per_page,
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
      // Converter Proxy para objeto JavaScript simples
      // Usando JSON.parse(JSON.stringify()) para remover a reatividade
      try {
        const plainFilters = JSON.parse(JSON.stringify(filters));
        
        // Garantir que arrays não sejam Proxy
        if (plainFilters.obras && Array.isArray(plainFilters.obras)) {
          plainFilters.obras = [...plainFilters.obras];
        }
        
        if (plainFilters.categorias_gasto && Array.isArray(plainFilters.categorias_gasto)) {
          plainFilters.categorias_gasto = [...plainFilters.categorias_gasto];
        }

        // dataInicio e dataFim -> data_inicio e data_fim
        if (plainFilters.dataInicio) {
          plainFilters.data_inicio = plainFilters.dataInicio;
        }
        if (plainFilters.dataFim) {
          plainFilters.data_fim = plainFilters.dataFim;
        }
        
        console.log('Filtros convertidos no store:', plainFilters);
        this.filters = plainFilters;
      } catch (error) {
        console.error('Erro ao converter filtros:', error);
        // Fallback para o método original
        this.filters = { ...filters };
      }
    },
    setPage(page: number) {
      this.page = page;
    },
    setPerPage(per_page: number | "all") {
      this.per_page = per_page;
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
