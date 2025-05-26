<template>
  <div class="table-container">
    <!-- Desktop View - Table -->
    <table v-if="!isMobile" class="data-table">
      <thead>
        <tr>
          <th @click="sortTable('descricao')" class="sortable-header">
            Descrição
            <span v-if="sortBy === 'descricao'" class="sort-icon">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th @click="sortTable('obra_id')" class="sortable-header">
            Obra
            <span v-if="sortBy === 'obra_id'" class="sort-icon">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th @click="sortTable('categoria_gasto_id')" class="sortable-header">
            Categoria
            <span v-if="sortBy === 'categoria_gasto_id'" class="sort-icon">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th @click="sortTable('fonte_pagadora_id')" class="sortable-header">
            Fonte Pagadora
            <span v-if="sortBy === 'fonte_pagadora_id'" class="sort-icon">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th @click="sortTable('valor')" class="sortable-header">
            Valor
            <span v-if="sortBy === 'valor'" class="sort-icon">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th @click="sortTable('data_compra')" class="sortable-header">
            Data Compra
            <span v-if="sortBy === 'data_compra'" class="sort-icon">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th @click="sortTable('data_pagamento')" class="sortable-header">
            Data Pagamento
            <span v-if="sortBy === 'data_pagamento'" class="sort-icon">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="gasto in gastos" :key="gasto.id" class="table-row">
          <td>{{ gasto.descricao }}</td>
          <td>{{ gasto.obra?.nome || gasto.obra_id }}</td>
          <td>{{ gasto.categoria_gasto?.nome || gasto.categoria_gasto_id }}</td>
          <td>{{ gasto.fonte_pagadora?.nome || gasto.fonte_pagadora_id }}</td>
          <td>{{ formatCurrency(gasto.valor) }}</td>
          <td>{{ formatDate(gasto.data_compra) }}</td>
          <td>{{ formatDate(gasto.data_pagamento) }}</td>
          <td>
            <div class="action-buttons">
              <!-- <button 
                class="action-button view-button" 
                @click="viewGasto(gasto)"
                title="Visualizar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                  <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                  <path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
              </button> -->
              <button 
                class="action-button edit-button" 
                @click="editGasto(gasto)"
                title="Editar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                  <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                  <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                </svg>
              </button>
              <button 
                class="action-button delete-button" 
                @click="deleteGasto(gasto)"
                title="Excluir"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                  <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </td>
          
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { Gasto, PaginationMeta, PaginationLinks } from '@/types/gasto.types';

const props = defineProps<{
  gastos: Gasto[];
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}>();

const emit = defineEmits<{
  (e: 'sort', field: string): void;
  (e: 'view', gasto: Gasto): void;
  (e: 'edit', gasto: Gasto): void;
  (e: 'delete', gasto: Gasto): void;
}>();

const isMobile = computed(() => window.innerWidth < 768);
const openMenuId = ref<number | null>(null);

function sortTable(field: string) {
  emit('sort', field);
}

function viewGasto(gasto: Gasto) {
  emit('view', gasto);
  openMenuId.value = null;
}
function editGasto(gasto: Gasto) {
  emit('edit', gasto);
  openMenuId.value = null;
}
function deleteGasto(gasto: Gasto) {
  emit('delete', gasto);
  openMenuId.value = null;
}
function toggleMenu(id: number) {
  openMenuId.value = openMenuId.value === id ? null : id;
}
function closeMenuOnClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.actions-menu') && !target.closest('.dropdown-menu')) {
    openMenuId.value = null;
  }
}
onMounted(() => {
  window.addEventListener('click', closeMenuOnClickOutside);
});
onUnmounted(() => {
  window.removeEventListener('click', closeMenuOnClickOutside);
});
function formatDate(date?: string | null) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
}
function formatCurrency(value?: number | null) {
  if (value == null) return '-';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
</script>

<style scoped>
.table-container {
  width: 100%;
  margin: 0;
  padding: 0;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 0;
  overflow: hidden;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.04);
}
.data-table th {
  background-color: #f9fafb;
  font-weight: 600;
  padding: 0.75rem 1rem;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}

.data-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #1f2937;
}
th.sortable-header {
  cursor: pointer;
  user-select: none;
}

.sortable-header:hover {
  background-color: #f3f4f6;
}

.sort-icon {
  margin-left: 0.25rem;
}
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  color: #6b7280;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
}

.action-button svg {
  width: 1rem;
  height: 1rem;
}

.action-button:hover {
  background-color: #e5e7eb;
}

.edit-button:hover {
  background-color: #dbeafe;
  color: #1e40af;
}

.delete-button:hover {
  background-color: #fee2e2;
  color: #b91c1c;
}

.view-button:hover {
  background-color: #dbeafe;
  color: #1e40af;
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.gasto-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.04);
}

.card-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.card-content {
  padding: 1rem;
}

.card-content > div {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.card-content > div:last-child {
  margin-bottom: 0;
}

.card-content b {
  color: #1f2937;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .data-table {
    display: none;
  }
  .cards-container {
    display: flex;
  }
}

.table-row:hover {
  background-color: #f9fafb;
}

@media (min-width: 769px) {
  .cards-container {
    display: none;
  }
}
</style>
