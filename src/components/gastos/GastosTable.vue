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
                <IconEdit size="16" />
              </button>
              <button 
                class="action-button delete-button" 
                @click="deleteGasto(gasto)"
                title="Excluir"
              >
                <IconDelete size="16" />
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
import IconEdit from '@/components/icons/IconEdit.vue';
import IconDelete from '@/components/icons/IconDelete.vue';

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
  gap: 0; /* Changed from 0.5rem for consistency */
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

/* Adjusted to target SVGs within components if necessary, though size prop should handle it. */
/* This also ensures direct SVGs would still be styled if used. */
.action-button svg, 
.action-button ::v-deep(svg) {
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
