<template>
  <div class="cards-container">
    <div 
      v-for="categoria in categoriasGastos" 
      :key="categoria.id" 
      class="data-card"
      :class="{ 'inactive-card': categoria.status === 'inativo' }"
    >
      <div class="card-header">
        <h3 class="card-title">
          <span class="card-id">#{{ categoria.id }}</span>
          {{ categoria.nome }}
        </h3>
        <span class="status-badge" :class="{ 'status-active': categoria.status === 'ativo', 'status-inactive': categoria.status === 'inativo' }">
          {{ categoria.status === 'ativo' ? 'Ativo' : 'Inativo' }}
        </span>
      </div>
      
      <div class="card-body">
        <div v-if="!clienteId" class="card-field">
          <span class="field-label">Cliente:</span>
          <span class="field-value">{{ categoria.cliente?.nome || 'Global' }}</span>
        </div>
        <div class="card-field">
          <span class="field-label">Descrição:</span>
          <span class="field-value">{{ categoria.descricao || '-' }}</span>
        </div>
        <div class="card-field">
          <span class="field-label">Cor:</span>
          <span class="field-value">
            <div class="color-preview" :style="{ backgroundColor: categoria.cor || '#cccccc' }"></div>
            {{ categoria.cor || '-' }}
          </span>
        </div>
      </div>
      
      <div class="card-actions">
        <button 
          class="action-button edit-button" 
          @click="editCategoriaGasto(categoria)"
          title="Editar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
          </svg>
          <span>Editar</span>
        </button>
        <button 
          class="action-button delete-button" 
          @click="deleteCategoriaGasto(categoria)"
          title="Excluir"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
          </svg>
          <span>Excluir</span>
        </button>
      </div>
    </div>
    
    <div v-if="categoriasGastos.length === 0" class="no-data-card">
      Nenhuma categoria de gasto encontrada
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CategoriaGasto } from '@/types/categoriaGasto.types'

// Props
const props = defineProps<{
  categoriasGastos: CategoriaGasto[]
  clienteId?: number
}>()

// Emits
const emit = defineEmits<{
  (e: 'edit', categoria: CategoriaGasto): void
  (e: 'delete', categoria: CategoriaGasto): void
}>()

// Métodos
const editCategoriaGasto = (categoria: CategoriaGasto) => {
  emit('edit', categoria)
}

const deleteCategoriaGasto = (categoria: CategoriaGasto) => {
  emit('delete', categoria)
}
</script>

<style scoped lang="scss">
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
  padding: $spacing-md;
  border-bottom: 1px solid $border-color;
  background-color: $background-light;
}

.card-title {
  font-weight: 600;
  font-size: $font-size-base;
  color: $text-gray-dark;
  margin: 0;
}

.card-id {
  font-weight: 700;
  color: $primary-color;
  margin-right: $spacing-xs;
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

.card-body {
  padding: $spacing-md;
}

.card-field {
  margin-bottom: $spacing-sm;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.card-field:last-child {
  margin-bottom: 0;
}

.field-label {
  font-weight: 600;
  color: $color-text-secondary;
  width: 100px;
  flex-shrink: 0;
}

.field-value {
  flex: 1;
  min-width: 0;
  color: $text-gray-dark;
  display: flex;
  align-items: center;
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

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-md;
  padding: $spacing-md;
  border-top: 1px solid $border-color;
  background-color: $bg-gray-light;
}

.action-button {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-sm $spacing-md;
  border: none;
  border-radius: $border-radius;
  cursor: pointer;
  transition: background-color $transition-speed;
  font-size: $font-size-sm;
  font-weight: 500;
}

.action-button svg {
  width: 16px;
  height: 16px;
}

.edit-button {
  background-color: rgba($primary-color, 0.1);
  color: $primary-color;
  border: 1px solid $primary-color;
}

.edit-button:hover {
  background-color: rgba($primary-color, 0.2);
}

.delete-button {
  background-color: rgba($error-color, 0.1);
  color: $error-color;
  border: 1px solid $error-color;
}

.delete-button:hover {
  background-color: rgba($error-color, 0.2);
}

.no-data-card {
  text-align: center;
  padding: $spacing-lg;
  background-color: white;
  border-radius: $border-radius;
  box-shadow: $shadow-sm;
  color: $color-text-secondary;
}
</style>
