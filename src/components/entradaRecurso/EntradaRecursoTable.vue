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
                <IconView size="16" />
              </button>
              <button 
                class="action-button edit-button" 
                @click="editEntradaRecurso(entradaRecurso)"
                title="Editar"
              >
                <IconEdit size="16" />
              </button>
              <button 
                class="action-button delete-button" 
                @click="deleteEntradaRecurso(entradaRecurso)"
                title="Excluir"
              >
                <IconDelete size="16" />
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
import IconView from '@/components/icons/IconView.vue';
import IconEdit from '@/components/icons/IconEdit.vue';
import IconDelete from '@/components/icons/IconDelete.vue';

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
