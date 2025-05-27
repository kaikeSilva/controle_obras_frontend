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
                <IconEdit size="16" />
              </button>
              <button 
                class="action-button delete-button" 
                @click="deleteCategoriaGasto(categoria)"
                title="Excluir"
              >
                <IconDelete size="16" />
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
              <IconEdit size="20" />
              <span>Editar</span>
            </button>
            <button 
              class="card-action-button delete-button" 
              @click="deleteCategoriaGasto(categoria)"
              title="Excluir"
            >
              <IconDelete size="20" />
              <span>Excluir</span>
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

import IconEdit from '@/components/icons/IconEdit.vue';
import IconDelete from '@/components/icons/IconDelete.vue';

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
  border-radius: 4px; // Assuming $border-radius or direct value
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
  gap: $spacing-xxs; // Use smaller gap for desktop buttons
  justify-content: center;
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px; // Direct value for precision
  border-radius: 4px; // Direct value for precision
  color: $text-gray-medium; // Assuming this is #6b7280
  transition: all 0.2s; // Direct value for precision
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;

  // Targets SVG within IconEdit/IconDelete components
  ::v-deep(svg) { // Using ::v-deep for robustness with scoped styles
    width: 1rem;
    height: 1rem;
  }
}

// Specific hover states for DESKTOP action buttons
.action-buttons {
  .edit-button:hover {
    background-color: #dbeafe; // Hex for consistency with ClientsTable/ObrasTable
    color: #1e40af;      // Hex for consistency with ClientsTable/ObrasTable
  }

  .delete-button:hover {
    background-color: #fee2e2; // Hex for consistency with ClientsTable/ObrasTable
    color: #b91c1c;      // Hex for consistency with ClientsTable/ObrasTable
  }
}


// Styles for MOBILE CARD action buttons
.card-action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto; // Accommodate icon + text
  height: auto; // Accommodate icon + text
  padding: $spacing-xs; // Should be ~0.5rem
  gap: $spacing-xxs; // Should be ~0.25rem, for space between icon and text
  border: 1px solid $border-color;
  border-radius: $border-radius; // Should be 4px
  cursor: pointer;
  transition: background-color $transition-speed; // Should be 0.2s
  background-color: white;

  // Targets SVG within IconEdit/IconDelete components used in cards
  ::v-deep(svg) { // Using ::v-deep for robustness
    width: 1.25rem; // Corresponds to size="20"
    height: 1.25rem; // Corresponds to size="20"
  }

  span {
    font-size: $font-size-sm; // Should be ~0.75rem
  }
}

// Base styles for MOBILE card action buttons (specific colors)
.card-action-button.edit-button {
  background-color: rgba($primary-color, 0.1);
  color: $primary-color;
}

.card-action-button.delete-button {
  background-color: rgba($error-color, 0.1);
  color: $error-color;
}

// Hover states for MOBILE card action buttons
.card-action-button.edit-button:hover {
  background-color: rgba($primary-color, 0.2); // Darken the background
}

.card-action-button.delete-button:hover {
  background-color: rgba($error-color, 0.2); // Darken the background
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
