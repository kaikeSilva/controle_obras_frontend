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
          <th @click="sortTable('endereco')" class="sortable-header">
            Endereço
            <span v-if="sortBy === 'endereco'" class="sort-icon">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th @click="sortTable('data_inicio')" class="sortable-header">
            Data Início
            <span v-if="sortBy === 'data_inicio'" class="sort-icon">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th @click="sortTable('prazo_estimado')" class="sortable-header">
            Prazo Estimado
            <span v-if="sortBy === 'prazo_estimado'" class="sort-icon">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th @click="sortTable('valor_estimado')" class="sortable-header">
            Valor Estimado
            <span v-if="sortBy === 'valor_estimado'" class="sort-icon">
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
        <tr class="table-row" v-for="obra in obras" :key="obra.id" :class="{ 'inactive-row': !obra.ativo }">
          <td v-if="!clienteId">
            {{ obra.cliente?.nome }}
          </td>
          <td><span style="font-weight: bold;">{{ obra.id }}</span> {{ obra.nome }}</td>
          <td>{{ obra.endereco || '-' }}</td>
          <td>{{ formatDate(obra.data_inicio) }}</td>
          <td>{{ formatDate(obra.prazo_estimado) }}</td>
          <td>{{ formatCurrency(obra.valor_estimado) }}</td>
          <td>
            <span class="status-badge" :class="getStatusClass(obra.status)">
              {{ getStatusLabel(obra.status) }}
            </span>
          </td>
          <td>
            <div class="action-buttons">
              <button 
                class="action-button view-button" 
                @click="viewObra(obra)"
                title="Visualizar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                  <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                  <path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
              </button>
              <button 
                class="action-button edit-button" 
                @click="editObra(obra)"
                title="Editar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                  <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                  <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                </svg>
              </button>
              <!-- report button -->
              <button 
                class="action-button report-button" 
                @click="reportObra(obra)"
                title="Relatório"
              >
                <IconReport />
              </button>
              <button 
                class="action-button delete-button" 
                @click="deleteObra(obra)"
                title="Excluir"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                  <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="obras.length === 0">
          <td colspan="8" class="no-data">Nenhuma obra encontrada</td>
        </tr>
      </tbody>
    </table>

    <!-- Mobile View - Cards -->
    <div v-else class="cards-container">
      <div 
        v-for="obra in obras" 
        :key="obra.id" 
        class="data-card"
        :class="{ 'inactive-card': !obra.ativo }"
      >
        <div class="card-header">
          <h3 class="card-title">{{ obra.nome }}</h3>
          <span class="status-badge" :class="getStatusClass(obra.status)">
            {{ getStatusLabel(obra.status) }}
          </span>
        </div>
        
        <div class="card-body">
          <div class="card-field">
            <span class="field-label">ID:</span>
            <span class="field-value">{{ obra.id }}</span>
          </div>
          <div class="card-field">
            <span class="field-label">Endereço:</span>
            <span class="field-value">{{ obra.endereco || '-' }}</span>
          </div>
          <div class="card-field">
            <span class="field-label">Data Início:</span>
            <span class="field-value">{{ formatDate(obra.data_inicio) }}</span>
          </div>
          <div class="card-field">
            <span class="field-label">Prazo Estimado:</span>
            <span class="field-value">{{ formatDate(obra.prazo_estimado) }}</span>
          </div>
          <div class="card-field">
            <span class="field-label">Valor Estimado:</span>
            <span class="field-value">{{ formatCurrency(obra.valor_estimado) }}</span>
          </div>
        </div>
        
        <div class="card-actions">
          <button 
            class="action-button view-button" 
            @click="viewObra(obra)"
            title="Visualizar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
              <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
              <path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
            </svg>
            <span>Visualizar</span>
          </button>
          <button 
            class="action-button edit-button" 
            @click="editObra(obra)"
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
            @click="deleteObra(obra)"
            title="Excluir"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
              <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
            </svg>
            <span>Excluir</span>
          </button>
        </div>
      </div>
      
      <div v-if="obras.length === 0" class="no-data-card">
        Nenhuma obra encontrada
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Obra } from '@/types/obra.types'
import IconReport from '@/components/icons/IconReport.vue'

// Props
const props = defineProps<{
  obras: Obra[]
  sortBy: string
  sortDirection: 'asc' | 'desc'
  isMobile: boolean
  clienteId: number | null
}>()

// Emits
const emit = defineEmits<{
  (e: 'edit', obra: Obra): void
  (e: 'delete', obra: Obra): void
  (e: 'sort', field: string): void
  (e: 'view', obra: Obra): void
}>()

// Métodos
const formatDate = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}

const viewObra = (obra: Obra) => {
  emit('view', obra)
}

const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return '-'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    'em_andamento': 'Em andamento',
    'concluida': 'Concluída',
    'pausada': 'Pausada'
  }
  return statusMap[status] || status
}

const getStatusClass = (status: string) => {
  const statusClassMap: Record<string, string> = {
    'em_andamento': 'status-in-progress',
    'concluida': 'status-completed',
    'pausada': 'status-paused'
  }
  return statusClassMap[status] || ''
}

const editObra = (obra: Obra) => {
  emit('edit', obra)
}

const deleteObra = (obra: Obra) => {
  emit('delete', obra)
}

const sortTable = (field: string) => {
  emit('sort', field)
}

// Router para navegação
const router = useRouter()

// Função para redirecionar para a página de relatório da obra
const reportObra = (obra: Obra) => {
  router.push(`/obras/${obra.id}/relatorio`)
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

.status-in-progress {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-completed {
  background-color: #dcfce7;
  color: #166534;
}

.status-paused {
  background-color: #fef3c7;
  color: #92400e;
}

.action-buttons {
  display: flex;
  gap: 0;
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

.toggle-button:hover {
  background-color: #fef3c7;
  color: #92400e;
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

.inactive-card {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
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

.card-actions .action-button {
  flex: 1;
  width: auto;
  height: auto;
  padding: 0.5rem;
  gap: 0.25rem;
}

.card-actions .action-button span {
  font-size: 0.75rem;
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

.table-row:hover {
  background-color: #f9fafb;
}

</style>
