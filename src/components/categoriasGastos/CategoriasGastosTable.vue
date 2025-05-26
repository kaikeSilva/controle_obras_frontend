<template>
  <div class="table-container">
    <!-- Desktop View - Table -->
    <table v-if="!isMobile" class="data-table">
      <thead>
        <tr>
          <th v-if="!clienteId" @click="sortTable('cliente_id')" class="sortable-header">
            Cliente
            <span v-if="sortBy === 'cliente_id'" class="sort-icon">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th @click="sortTable('nome')" class="sortable-header">
            Nome
            <span v-if="sortBy === 'nome'" class="sort-icon">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th @click="sortTable('descricao')" class="sortable-header">
            Descrição
            <span v-if="sortBy === 'descricao'" class="sort-icon">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th @click="sortTable('cor')" class="sortable-header">
            Cor
            <span v-if="sortBy === 'cor'" class="sort-icon">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th @click="sortTable('status')" class="sortable-header">
            Status
            <span v-if="sortBy === 'status'" class="sort-icon">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr class="table-row" v-for="categoria in categoriasGastos" :key="categoria.id" :class="{ 'inactive-row': categoria.status === 'inativo' }">
          <td v-if="!clienteId">
            {{ categoria.cliente?.nome || 'Global' }}
          </td>
          <td><span style="font-weight: bold;">{{ categoria.id }}</span> {{ categoria.nome }}</td>
          <td>{{ categoria.descricao || '-' }}</td>
          <td>
            <div class="color-preview" :style="{ backgroundColor: categoria.cor || '#cccccc' }"></div>
            {{ categoria.cor || '-' }}
          </td>
          <td>
            <span class="status-badge" :class="{ 'status-active': categoria.status === 'ativo', 'status-inactive': categoria.status === 'inativo' }">
              {{ categoria.status === 'ativo' ? 'Ativo' : 'Inativo' }}
            </span>
          </td>
          <td>
            <div class="action-buttons">
              <button 
                class="action-button edit-button" 
                @click="editCategoriaGasto(categoria)"
                title="Editar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                  <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                  <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                </svg>
              </button>
              <button 
                class="action-button delete-button" 
                @click="deleteCategoriaGasto(categoria)"
                title="Excluir"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                  <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="categoriasGastos.length === 0">
          <td :colspan="clienteId ? 5 : 6" class="empty-message">
            Nenhuma categoria de gasto encontrada.
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Mobile View - Cards -->
    <div v-else class="cards-container">
      <div 
        v-for="categoria in categoriasGastos" 
        :key="categoria.id" 
        class="data-card"
        :class="{ 'inactive-card': !categoria.status }"
      >
        <div class="card-header">
          <div class="card-title">
            <span class="card-id">#{{ categoria.id }}</span>
            {{ categoria.nome }}
          </div>
          <div class="card-actions">
            <button 
              class="card-action-button edit-button" 
              @click="editCategoriaGasto(categoria)"
              title="Editar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
              </svg>
            </button>
            <button 
              class="card-action-button delete-button" 
              @click="deleteCategoriaGasto(categoria)"
              title="Excluir"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        <div class="card-content">
          <div v-if="!clienteId" class="card-field">
            <div class="card-field-label">Cliente:</div>
            <div class="card-field-value">{{ categoria.cliente?.nome || 'Global' }}</div>
          </div>
          <div class="card-field">
            <div class="card-field-label">Descrição:</div>
            <div class="card-field-value">{{ categoria.descricao || '-' }}</div>
          </div>
          <div class="card-field">
            <div class="card-field-label">Cor:</div>
            <div class="card-field-value">
              <div class="color-preview" :style="{ backgroundColor: categoria.cor || '#cccccc' }"></div>
              {{ categoria.cor || '-' }}
            </div>
          </div>
          <div class="card-field">
            <div class="card-field-label">Status:</div>
            <div class="card-field-value">
              <span class="status-badge" :class="{ 'status-active': categoria.status, 'status-inactive': !categoria.status }">
                {{ categoria.status ? 'Ativo' : 'Inativo' }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="categoriasGastos.length === 0" class="empty-card">
        Nenhuma categoria de gasto encontrada.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CategoriaGasto } from '@/types/categoriaGasto.types'

// Props
const props = defineProps<{
  categoriasGastos: CategoriaGasto[];
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  isMobile: boolean;
  clienteId?: number;
}>()

// Emits
const emit = defineEmits<{
  (e: 'edit', categoria: CategoriaGasto): void;
  (e: 'delete', categoria: CategoriaGasto): void;
  (e: 'sort', field: string): void;
}>()

// Métodos
const editCategoriaGasto = (categoria: CategoriaGasto) => {
  emit('edit', categoria)
}

const deleteCategoriaGasto = (categoria: CategoriaGasto) => {
  emit('delete', categoria)
}

const sortTable = (field: string) => {
  emit('sort', field)
}
</script>

<style scoped lang="scss">
.table-container {
  width: 100%;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: $font-size-base;
}

.data-table th {
  background-color: $background-light;
  padding: $spacing-sm;
  text-align: left;
  font-weight: 600;
  color: $text-gray-dark;
  border-bottom: 1px solid $border-color;
}

.sortable-header {
  cursor: pointer;
  user-select: none;
  position: relative;
  padding-right: $spacing-md;
}

.sort-icon {
  position: absolute;
  right: $spacing-xs;
  top: 50%;
  transform: translateY(-50%);
}

.data-table td {
  padding: $spacing-sm;
  border-bottom: 1px solid $border-color;
  color: $text-gray-dark;
}

.table-row {
  transition: background-color $transition-speed;
}

.table-row:hover {
  background-color: rgba($primary-color, 0.05);
}

.inactive-row {
  background-color: rgba($background-light, 0.3);
}

.inactive-row:hover {
  background-color: rgba($background-light, 0.5);
}

.color-preview {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  margin-right: $spacing-xs;
  vertical-align: middle;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: $font-size-sm;
  font-weight: 500;
}

.status-active {
  background-color: rgba($success-color, 0.2);
  color: $success-color;
}

.status-inactive {
  background-color: rgba($background-light, 0.3);
  color: $color-text-secondary;
}

.action-buttons {
  display: flex;
  gap: $spacing-xs;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: $border-radius;
  cursor: pointer;
  transition: background-color $transition-speed;
}

.action-button svg {
  width: 16px;
  height: 16px;
}

.card-action-button.edit-button {
  background-color: rgba($primary-color, 0.1);
  color: $primary-color;
  border-color: $primary-color;
}

.edit-button:hover {
  background-color: rgba($primary-color, 0.2);
}

.card-action-button.delete-button {
  background-color: rgba($error-color, 0.1);
  color: $error-color;
  border-color: $error-color;
}

.delete-button:hover {
  background-color: rgba($error-color, 0.2);
}

.empty-message {
  text-align: center;
  padding: $spacing-lg;
  color: $color-text-secondary;
}

/* Mobile Cards */
.cards-container {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  margin-bottom: $spacing-lg;
}

.data-card {
  background-color: white;
  border-radius: $border-radius;
  box-shadow: $shadow-sm;
  overflow: hidden;
  transition: transform $transition-speed, box-shadow $transition-speed;
}

.data-card:hover {
  transform: translateY(-2px);
  box-shadow: $shadow-md;
}

.inactive-card {
  background-color: rgba($background-light, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-sm;
  border-bottom: 1px solid $border-color;
  background-color: $background-light;
}

.card-title {
  font-weight: 600;
  font-size: $font-size-base;
  color: $text-gray-dark;
}

.card-id {
  font-weight: 700;
  color: $primary-color;
  margin-right: $spacing-xs;
}

.card-actions {
  display: flex;
  gap: $spacing-md;
  margin-left: $spacing-md;
}

.card-action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  cursor: pointer;
  transition: background-color $transition-speed;
  background-color: white;
}

.card-action-button svg {
  width: 20px;
  height: 20px;
}

.card-content {
  padding: $spacing-sm;
}

.card-field {
  margin-bottom: $spacing-xs;
  display: flex;
  flex-wrap: wrap;
}

.card-field:last-child {
  margin-bottom: 0;
}

.card-field-label {
  font-weight: 600;
  color: $color-text-secondary;
  width: 100px;
  flex-shrink: 0;
}

.card-field-value {
  flex: 1;
  min-width: 0;
  color: $text-gray-dark;
}

.empty-card {
  text-align: center;
  padding: $spacing-lg;
  background-color: white;
  border-radius: $border-radius;
  box-shadow: $shadow-sm;
  color: $color-text-secondary;
}
</style>
