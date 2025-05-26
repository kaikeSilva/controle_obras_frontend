<template>
  <div class="table-container">
    <!-- Desktop View - Table -->
    <table class="data-table">
      <thead>
        <tr>
          <th v-if="!obraId" @click="sortTable('obra_id')" class="sortable-header">
            Obra
            <span v-if="sortBy === 'obra_id'" class="sort-icon">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th v-if="!fontePagadoraId" @click="sortTable('fonte_pagadora_id')" class="sortable-header">
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
          <th @click="sortTable('data_entrada')" class="sortable-header">
            Data de Entrada
            <span v-if="sortBy === 'data_entrada'" class="sort-icon">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th @click="sortTable('tipo_entrada')" class="sortable-header">
            Tipo de Entrada
            <span v-if="sortBy === 'tipo_entrada'" class="sort-icon">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th @click="sortTable('descricao')" class="sortable-header">
            Descrição
            <span v-if="sortBy === 'descricao'" class="sort-icon">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr class="table-row" v-for="entradaRecurso in entradasRecursos" :key="entradaRecurso.id" :class="{ 'inactive-row': entradaRecurso.deleted_at }">
          <td v-if="!obraId">
            {{ entradaRecurso.obra?.nome }}
          </td>
          <td v-if="!fontePagadoraId">
            {{ entradaRecurso.fonte_pagadora?.nome }}
          </td>
          <td>{{ formatCurrency(entradaRecurso.valor) }}</td>
          <td>{{ formatDate(entradaRecurso.data_entrada) }}</td>
          <td>
            <span class="status-badge" :class="getStatusClass(entradaRecurso.tipo_entrada)">
              {{ getStatusLabel(entradaRecurso.tipo_entrada) }}
            </span>
          </td>
          <td>{{ entradaRecurso.descricao || '-' }}</td>
          <td>
            <div class="action-buttons">
              <button 
                class="action-button view-button" 
                @click="viewEntradaRecurso(entradaRecurso)"
                title="Visualizar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                  <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                  <path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
              </button>
              <button 
                class="action-button edit-button" 
                @click="editEntradaRecurso(entradaRecurso)"
                title="Editar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                  <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                  <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                </svg>
              </button>
              <button 
                class="action-button delete-button" 
                @click="deleteEntradaRecurso(entradaRecurso)"
                title="Excluir"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                  <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="entradasRecursos.length === 0">
          <td :colspan="obraId && fontePagadoraId ? 5 : (obraId || fontePagadoraId ? 6 : 7)" class="no-data">
            Nenhuma entrada de recurso encontrada
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EntradaRecurso } from '@/types/entrada-recurso.types'

// Props
const props = defineProps<{
  entradasRecursos: EntradaRecurso[]
  sortBy: string
  sortDirection: 'asc' | 'desc'
  obraId?: number | null
  fontePagadoraId?: number | null
}>()

// Emits
const emit = defineEmits<{
  (e: 'edit', entradaRecurso: EntradaRecurso): void
  (e: 'delete', entradaRecurso: EntradaRecurso): void
  (e: 'sort', field: string): void
  (e: 'view', entradaRecurso: EntradaRecurso): void
}>()

// Métodos
const formatDate = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}

const viewEntradaRecurso = (entradaRecurso: EntradaRecurso) => {
  emit('view', entradaRecurso)
}

const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return '-'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const getStatusLabel = (tipoEntrada: string) => {
  const statusMap: Record<string, string> = {
    'aporte_inicial': 'Aporte Inicial',
    'aporte_adicional': 'Aporte Adicional',
    'reembolso': 'Reembolso',
    'regular': 'Regular'
  }
  return statusMap[tipoEntrada] || tipoEntrada
}

const getStatusClass = (tipoEntrada: string) => {
  const statusClassMap: Record<string, string> = {
    'aporte_inicial': 'status-aporte-inicial',
    'aporte_adicional': 'status-aporte-adicional',
    'reembolso': 'status-reembolso',
    'regular': 'status-regular'
  }
  return statusClassMap[tipoEntrada] || ''
}

const editEntradaRecurso = (entradaRecurso: EntradaRecurso) => {
  emit('edit', entradaRecurso)
}

const deleteEntradaRecurso = (entradaRecurso: EntradaRecurso) => {
  emit('delete', entradaRecurso)
}

const sortTable = (field: string) => {
  emit('sort', field)
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
  box-shadow: none;
  font-size: 0.875rem;
  text-align: left;
}

.data-table th {
  background-color: #f9fafb;
  font-weight: 600;
  padding: 0.75rem 1rem;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #1f2937;
}

.sortable-header {
  cursor: pointer;
  position: relative;
  padding-right: 1.5rem;
  user-select: none;
}

.sortable-header:hover {
  background-color: #f3f4f6;
}

.sort-icon {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: 0.75rem;
}

.inactive-row {
  background-color: #f3f4f6;
  color: #6b7280;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
  text-transform: capitalize;
}

.status-aporte-inicial {
  background-color: #dcfce7;
  color: #166534;
}

.status-aporte-adicional {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-reembolso {
  background-color: #fef3c7;
  color: #92400e;
}

.status-regular {
  background-color: #e0e7ff;
  color: #4338ca;
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

.no-data {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-style: italic;
}

.table-row:hover {
  background-color: #f9fafb;
}
</style>
