<template>
  <div class="cards-container">
    <div 
      v-for="gasto in gastos" 
      :key="gasto.id" 
      class="data-card"
    >
      <div class="card-header">
        <h3 class="card-title">{{ gasto.descricao }}</h3>
        <span 
          v-if="gasto.data_pagamento" 
          class="status-badge status-paid"
        >
          Pago
        </span>
        <span 
          v-else 
          class="status-badge status-pending"
        >
          Pendente
        </span>
      </div>
      
      <div class="card-body">
        <div class="card-field">
          <span class="field-label">ID:</span>
          <span class="field-value">{{ gasto.id }}</span>
        </div>
        <div class="card-field">
          <span class="field-label">Obra:</span>
          <span class="field-value">{{ gasto.obra?.nome || gasto.obra_id }}</span>
        </div>
        <div class="card-field">
          <span class="field-label">Categoria:</span>
          <span class="field-value">{{ gasto.categoria_gasto?.nome || gasto.categoria_gasto_id }}</span>
        </div>
        <div class="card-field">
          <span class="field-label">Fonte Pagadora:</span>
          <span class="field-value">{{ gasto.fonte_pagadora?.nome || gasto.fonte_pagadora_id }}</span>
        </div>
        <div class="card-field">
          <span class="field-label">Valor:</span>
          <span class="field-value">{{ formatCurrency(gasto.valor) }}</span>
        </div>
        <div class="card-field">
          <span class="field-label">Data Compra:</span>
          <span class="field-value">{{ formatDate(gasto.data_compra) }}</span>
        </div>
        <div class="card-field">
          <span class="field-label">Data Pagamento:</span>
          <span class="field-value">{{ formatDate(gasto.data_pagamento) }}</span>
        </div>
        <div class="card-field" v-if="gasto.numero_documento">
          <span class="field-label">Nº Documento:</span>
          <span class="field-value">{{ gasto.numero_documento }}</span>
        </div>
      </div>
      
      <div class="card-actions">
        <!-- <button 
          class="action-button view-button" 
          @click="viewGasto(gasto)"
          title="Visualizar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
            <path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
          </svg>
          <span>Visualizar</span>
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
          <span>Editar</span>
        </button>
        <button 
          class="action-button delete-button" 
          @click="deleteGasto(gasto)"
          title="Excluir"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
          </svg>
          <span>Excluir</span>
        </button>
      </div>
    </div>
    
    <div v-if="gastos.length === 0" class="no-data-card">
      Nenhum gasto encontrado
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Gasto } from '@/types/gasto.types';

const props = defineProps<{
  gastos: Gasto[];
}>();

// Emits
const emit = defineEmits<{
  (e: 'edit', gasto: Gasto): void
  (e: 'delete', gasto: Gasto): void
  (e: 'view', gasto: Gasto): void
}>();

// Métodos
function formatDate(date?: string | null) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
}

function formatCurrency(value?: number | null) {
  if (value == null) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function viewGasto(gasto: Gasto) {
  emit('view', gasto);
}

function editGasto(gasto: Gasto) {
  emit('edit', gasto);
}

function deleteGasto(gasto: Gasto) {
  emit('delete', gasto);
}
</script>

<style scoped>
/* Mobile Cards */
.cards-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.data-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.card-header {
  padding: 1rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-paid {
  background-color: #dcfce7;
  color: #166534;
}

.status-pending {
  background-color: #fef3c7;
  color: #92400e;
}

.card-body {
  padding: 1rem;
}

.card-field {
  margin-bottom: 0.5rem;
  display: flex;
  flex-wrap: wrap;
}

.field-label {
  font-weight: 600;
  color: #4b5563;
  width: 40%;
}

.field-value {
  color: #1f2937;
  width: 60%;
}

.card-actions {
  display: flex;
  padding: 0.5rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: auto;
  height: auto;
  padding: 0.5rem;
  gap: 0.25rem;
  border: none;
  border-radius: 0.375rem;
  background-color: #f3f4f6;
  color: #4b5563;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-button svg {
  width: 1rem;
  height: 1rem;
}

.action-button span {
  font-size: 0.75rem;
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

.no-data-card {
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  color: #6b7280;
  font-style: italic;
}

@media (min-width: 769px) {
  .cards-container {
    display: none;
  }
}
</style>
