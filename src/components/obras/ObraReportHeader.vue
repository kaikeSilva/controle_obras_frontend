<template>
  <div class="obra-header" v-if="obra">
    <div class="obra-header-content">
      <div class="obra-info">
        <h1 class="obra-title">{{ obra.nome }}</h1>
        <div class="obra-details">
          <div class="obra-detail-item">
            <span class="detail-label">Status:</span>
            <span class="detail-value status-badge" :class="getStatusClass(obra.status)">{{ getStatusLabel(obra.status) }}</span>
          </div>
          <div class="obra-detail-item">
            <span class="detail-label">Endereço:</span>
            <span class="detail-value">{{ obra.endereco || '-' }}</span>
          </div>
          <div class="obra-detail-item">
            <span class="detail-label">Data Início:</span>
            <span class="detail-value">{{ formatDate(obra.data_inicio) }}</span>
          </div>
          <div class="obra-detail-item">
            <span class="detail-label">Prazo Estimado:</span>
            <span class="detail-value">{{ formatDate(obra.prazo_estimado) }}</span>
          </div>
          <div class="obra-detail-item">
            <span class="detail-label">Valor Estimado:</span>
            <span class="detail-value">{{ formatCurrency(obra.valor_estimado) }}</span>
          </div>
        </div>
      </div>
      
      <div class="cliente-info" v-if="obra.cliente">
        <h2 class="cliente-title">Cliente</h2>
        <div class="cliente-details">
          <div class="cliente-detail-item">
            <span class="detail-label">Nome:</span>
            <span class="detail-value">{{ obra.cliente.nome }}</span>
          </div>
          <div class="cliente-detail-item" v-if="obra.cliente.phone">
            <span class="detail-label">Telefone:</span>
            <span class="detail-value">{{ obra.cliente.phone }}</span>
          </div>
          <div class="cliente-detail-item" v-if="obra.cliente.email">
            <span class="detail-label">Email:</span>
            <span class="detail-value">{{ obra.cliente.email }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type { Obra } from '@/types/obra.types'

// Props
const props = defineProps<{
  obra: Obra | null
}>()

// Métodos
function formatDate(dateString: string) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('pt-BR')
}

function formatCurrency(value?: number) {
  if (value === undefined || value === null) return '-'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function getStatusLabel(status: string) {
  const statusMap: Record<string, string> = {
    'em_andamento': 'Em Andamento',
    'concluida': 'Concluída',
    'pausada': 'Pausada',
    'cancelada': 'Cancelada'
  }
  return statusMap[status] || status
}

function getStatusClass(status: string) {
  const statusClassMap: Record<string, string> = {
    'em_andamento': 'status-em-andamento',
    'concluida': 'status-concluida',
    'pausada': 'status-pausada',
    'cancelada': 'status-cancelada'
  }
  return statusClassMap[status] || ''
}
</script>

<style scoped lang="scss">
/* Obra Header */
.obra-header {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  
  @include dark-mode {
    background-color: #1e1e1e;
    border-color: #333;
  }
}

.obra-header-content {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
}

.obra-info {
  flex: 1;
  min-width: 300px;
}

.obra-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #0f172a;
  
  @include dark-mode {
    color: #f1f1f1;
  }
}

.obra-details {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.obra-detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  
  @include dark-mode {
    color: #94a3b8;
  }
}

.detail-value {
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
  
  @include dark-mode {
    color: #e2e8f0;
  }
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: white;
  width: fit-content;
}

.status-em-andamento {
  background-color: #3b82f6;
}

.status-concluida {
  background-color: #10b981;
}

.status-pausada {
  background-color: #f59e0b;
}

.status-cancelada {
  background-color: #ef4444;
}

/* Cliente Info */
.cliente-info {
  flex: 1;
  min-width: 300px;
}

.cliente-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #0f172a;
  
  @include dark-mode {
    color: #f1f1f1;
  }
}

.cliente-details {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.cliente-detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
