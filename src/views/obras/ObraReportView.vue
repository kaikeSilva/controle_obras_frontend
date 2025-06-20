<template>
  <div class="obra-report-container">
    <!-- PDF Controls -->
    <div class="pdf-controls">
      <button @click="generatePDF" :disabled="isGeneratingPdf" class="pdf-button">
        <span v-if="isGeneratingPdf && pdfStatus === 'pending'">Solicitando relatório...</span>
        <span v-else-if="isGeneratingPdf && pdfStatus === 'processing'">Gerando PDF, aguarde...</span>
        <span v-else>📄 Gerar PDF</span>
      </button>
      <button 
        v-if="isGeneratingPdf && pdfStatus === 'processing'" 
        @click="cancelPdfGeneration" 
        class="cancel-button"
      >
        Cancelar
      </button>
    </div>
    
    <!-- Conteúdo que será convertido em PDF -->
    <div ref="pdfContent" class="pdf-content">
      
      <!-- Cabeçalho com informações da obra e cliente -->
      <ObraReportHeader :obra="obraData" />

      <!-- Filters Section -->
      <ObraReportFilter 
        :obra="obraData"
        @filter-applied="handleFilterUpdated"
      />

      <!-- Loading Indicator -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Carregando dados...</p>
      </div>

      <!-- Error Message -->
      <div v-else-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button class="retry-button" @click="fetchData">Tentar novamente</button>
      </div>

      <!-- Dashboard Content -->
      <div v-else-if="dashboardStore.chartData">
        <!-- Stats Grid -->
        <div class="stats-grid">
          <DashboardCard 
            v-for="(card, index) in dashboardStore.statCards || []" 
            :key="index"
            :title="card.title"
            :value="card.value"
            :icon="card.icon"
            :change="card.change"
          />
        </div>

        <!-- Chart Section -->
        <DashboardMonthEvolution :chartData="dashboardStore.chartData" />
        
        <!-- Gastos Table Section -->
        <div class="gastos-section">
          <h2 class="section-title">Detalhamento de Gastos</h2>
          
          <!-- Loading Indicator for Gastos -->
          <div v-if="isLoadingGastos" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Carregando gastos...</p>
          </div>
          
          <!-- Error Message for Gastos -->
          <div v-else-if="gastosError" class="error-container">
            <p class="error-message">{{ gastosError }}</p>
            <button class="retry-button" @click="fetchGastos">Tentar novamente</button>
          </div>
          
          <!-- Gastos Table -->
          <div v-else-if="gastosStore.gastos.length > 0" class="gastos-table-container">
            <table class="gastos-table">
              <thead>
                <tr>
                  <th>Data do Pagamento</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Valor</th>
                  <th>Fonte Pagadora</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="gasto in gastosStore.gastos" :key="gasto.id">
                  <td>{{ formatDate(gasto.data_pagamento) }}</td>
                  <td>{{ gasto.descricao }}</td>
                  <td>
                    <span 
                      class="categoria-badge" 
                      :style="{ backgroundColor: gasto.categoria_gasto?.cor }"
                    >
                      {{ gasto.categoria_gasto?.nome || 'N/A' }}
                    </span>
                  </td>
                  <td class="valor-cell">{{ formatCurrency(gasto.valor) }}</td>
                  <td>{{ gasto.fonte_pagadora?.nome || 'N/A' }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="total-label">Total</td>
                  <td class="total-value">{{ formatCurrency(totalGastos) }}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <!-- No Gastos Message -->
          <div v-else class="no-data-message">
            <p>Nenhum gasto encontrado com os filtros aplicados.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardCard from '@/components/dashboard/DashboardCard.vue'
import DashboardMonthEvolution from '@/components/dashboard/DashboardMonthEvolution.vue'
import ObraReportHeader from '@/components/obras/ObraReportHeader.vue'
import ObraReportFilter from '@/components/obras/ObraReportFilter.vue'
import { obrasService } from '@/services/obrasService'
import type { Obra } from '@/types/obra.types'
import type { Gasto, PaginationMeta } from '@/types/gasto.types'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useGastosStore } from '@/stores/gastosStore'
// Refs
const route = useRoute()
const router = useRouter()
const pdfContent = ref<HTMLElement | null>(null)
const isGeneratingPdf = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)
const dashboardData = ref<DashboardData | null>(null)
const obraData = ref<Obra | null>(null)
const pdfStatus = ref<'pending' | 'processing' | 'completed' | 'error'>('pending')
const pdfFilename = ref<string | null>(null)
const pdfPollingInterval = ref<number | null>(null)

// Estado para os gastos
const isLoadingGastos = ref(false)
const currentPage = ref(1)

const dashboardStore = useDashboardStore()
const notificationStore = useNotificationStore()
const gastosStore = useGastosStore()
// Obter o ID da obra da rota
const obraId = computed(() => {
  return route.params.id ? Number(route.params.id) : null
})

// Inicializar com datas do mês atual
const today = new Date()
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

// Métodos
function formatDate(dateString: string) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR')
}

function formatCurrency(value?: number) {
  if (value === undefined || value === null) return '-'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

// Calcular total de gastos na página atual
const totalGastos = computed(() => {
  
  return gastosStore.gastos.reduce((total, gasto) => total + gasto.valor, 0)
})

function handleFilterUpdated(filters: DashboardFiltros) {
  
  // Converter o objeto Proxy para um objeto JavaScript simples
  const plainFilters = JSON.parse(JSON.stringify(filters))
  
  // Garantir que obras seja um array de números simples, não um Proxy
  if (plainFilters.obras && Array.isArray(plainFilters.obras)) {
    plainFilters.obras = [...plainFilters.obras]
  }
  
  
  // Passar os filtros convertidos para o store
  gastosStore.setFilters(plainFilters)
  gastosStore.setPerPage("all")
  fetchGastos()
}

// Buscar dados da obra
async function fetchObraData() {
  if (!obraId.value) return
  
  try {
    const response = await obrasService.getObra(obraId.value)
    // Verificar se a resposta tem uma propriedade 'data'
    obraData.value = response.data || response
  } catch (err) {
    console.error('Erro ao buscar dados da obra:', err)
  }
}

// Buscar gastos da obra com filtros
async function fetchGastos() {
  if (!obraId.value) return
  
  isLoadingGastos.value = true
  
  try {
    await gastosStore.fetchGastos()
  } catch (err) {
    console.error('Erro ao buscar gastos:', err)
  } finally {
    isLoadingGastos.value = false
  }
}

// Método para gerar PDF usando o fluxo assíncrono da API do backend
const generatePDF = async () => {
  if (isGeneratingPdf.value) return
  
  isGeneratingPdf.value = true
  pdfStatus.value = 'pending'
  
  try {
    // 1. Solicitar a geração do PDF
    pdfFilename.value = await obrasService.solicitarRelatorioPDF(dashboardStore.filtros)
    
    if (!pdfFilename.value) {
      throw new Error('Não foi possível iniciar a geração do PDF')
    }
    
    // 2. Atualizar status para processando
    pdfStatus.value = 'processing'
    
    // 3. Verificar status periodicamente até completar
    const downloadUrl = await aguardarPDF(pdfFilename.value)
    
    // 4. Iniciar o download quando estiver pronto
    window.location.href = downloadUrl
    
    notificationStore.addNotification('PDF gerado com sucesso!', 'success')
    pdfStatus.value = 'completed'
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    notificationStore.addNotification('Erro ao gerar PDF. Tente novamente.', 'error')
    pdfStatus.value = 'error'
  } finally {
    isGeneratingPdf.value = false
  }
}

// Função para cancelar a geração do PDF
const cancelPdfGeneration = () => {
  if (pdfPollingInterval.value) {
    clearInterval(pdfPollingInterval.value)
    pdfPollingInterval.value = null
  }
  
  isGeneratingPdf.value = false
  pdfStatus.value = 'pending'
  notificationStore.addNotification('Geração de PDF cancelada', 'info')
}

// Função para verificar o status periodicamente até o PDF estar pronto
const aguardarPDF = async (filename: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Limpar qualquer intervalo existente
    if (pdfPollingInterval.value) {
      clearInterval(pdfPollingInterval.value)
    }
    
    // Criar novo intervalo de polling
    pdfPollingInterval.value = window.setInterval(async () => {
      try {
        const statusResponse = await obrasService.verificarStatusRelatorioPDF(filename)
        
        if (statusResponse.status === 'completed' && statusResponse.download_url) {
          if (pdfPollingInterval.value) {
            clearInterval(pdfPollingInterval.value)
            pdfPollingInterval.value = null
          }
          resolve(statusResponse.download_url)
        } else if (statusResponse.status === 'error') {
          if (pdfPollingInterval.value) {
            clearInterval(pdfPollingInterval.value)
            pdfPollingInterval.value = null
          }
          reject(new Error('Erro ao gerar o PDF no servidor'))
        }
      } catch (error) {
        if (pdfPollingInterval.value) {
          clearInterval(pdfPollingInterval.value)
          pdfPollingInterval.value = null
        }
        reject(error)
      }
    }, 2000) // Verificar a cada 2 segundos
  })
}

// Inicializar o carregamento dos dados
onMounted(async () => {
  if (!obraId.value) {
    router.push('/obras')
    return
  }
  
  await fetchObraData()
  await fetchGastos()
})
</script>

<style scoped lang="scss">
.obra-report-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* PDF Controls */
.pdf-controls {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  
  .pdf-button {
    background-color: #dc2626;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
    
    &:hover:not(:disabled) {
      background-color: #b91c1c;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
    }
  }
  
  .cancel-button {
    background-color: #6b7280;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(107, 114, 128, 0.2);
    
    &:hover {
      background-color: #4b5563;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(107, 114, 128, 0.3);
    }
  }
}

/* PDF Header - oculto na tela, visível no PDF */
.pdf-header {
  display: none;
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  
  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 8px;
  }
  
  .pdf-date {
    color: #6b7280;
    font-size: 16px;
    margin-bottom: 16px;
  }
  
  .pdf-divider {
    border: none;
    border-top: 2px solid #e5e7eb;
    margin: 20px 0;
  }
  
  .pdf-info-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
    text-align: left;
    margin: 20px 0;
  }
  
  .pdf-section-title {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 12px;
    text-align: left;
  }
  
  .pdf-info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .pdf-info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .pdf-info-label {
    font-size: 12px;
    font-weight: 500;
    color: #6b7280;
  }
  
  .pdf-info-value {
    font-size: 14px;
    color: #1f2937;
    font-weight: 500;
  }
}

/* Obra Header styles moved to ObraReportHeader component */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  break-inside: avoid;
  page-break-inside: avoid;
}

/* Loading Styles */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #6b7280;
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: #3b82f6;
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 16px;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
}

/* Error Styles */
.error-container {
  background-color: #fee2e2;
  border: 1px solid #ef4444;
  border-radius: 6px;
  padding: 16px;
  margin: 20px 0;
  text-align: center;
  
  .error-message {
    color: #b91c1c;
    font-weight: 500;
    margin-bottom: 12px;
  }
  
  .retry-button {
    background-color: #ef4444;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #dc2626;
    }
  }
}

/* Filters Section */
/* Filter styles moved to ObraReportFilter component */

.icon {
  display: inline-block;
  vertical-align: middle;
}
/* Gastos Table Styles */
.gastos-section {
  margin-top: 40px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
}

.gastos-table-container {
  overflow-x: auto;
  margin-bottom: 24px;
}

.gastos-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  
  th, td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
  }
  
  th {
    background-color: #f9fafb;
    font-weight: 600;
    color: #374151;
  }
  
  tbody tr:hover {
    background-color: #f3f4f6;
  }
  
  .valor-cell {
    text-align: right;
    font-weight: 500;
  }
  
  tfoot {
    font-weight: 600;
    
    .total-label {
      text-align: right;
    }
    
    .total-value {
      text-align: right;
      color: #1f2937;
      font-weight: 700;
    }
  }
}

.categoria-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  
  .pagination-button {
    background-color: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover:not(:disabled) {
      background-color: #e5e7eb;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  .pagination-info {
    font-size: 14px;
    color: #6b7280;
  }
}

.no-data-message {
  text-align: center;
  padding: 32px;
  color: #6b7280;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
}
</style>
