<template>
  <div class="obra-report-container">
    <!-- PDF Controls -->
    <div class="pdf-controls">
      <button @click="generatePDF" :disabled="isGenerating" class="pdf-button">
        <span v-if="isGenerating">{{ pdfWebSocket.pdfJobState.currentStep || 'Gerando PDF...' }}</span>
        <span v-else>📄 Gerar PDF</span>
      </button>
      <button 
        v-if="isGenerating" 
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
    
    <!-- Modal de progresso do PDF -->
    <PdfProgressModal
      :show="showPdfModal"
      :pdf-state="pdfWebSocket.pdfJobState"
      title="Gerando Relatório PDF"
      :can-close="!pdfWebSocket.isGenerating"
      :show-cancel-button="pdfWebSocket.isGenerating"
      @close="handleCloseModal"
      @cancel="cancelPdfGeneration"
      @retry="handleRetryPdf"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardCard from '@/components/dashboard/DashboardCard.vue'
import DashboardMonthEvolution from '@/components/dashboard/DashboardMonthEvolution.vue'
import ObraReportHeader from '@/components/obras/ObraReportHeader.vue'
import ObraReportFilter from '@/components/obras/ObraReportFilter.vue'
import PdfProgressModal from '@/components/pdf/PdfProgressModal.vue'
import { obrasService } from '@/services/obrasService'
import { pdfReportService } from '@/services/pdfReportService'
import { usePdfWebSocket } from '@/composables/usePdfWebSocket'
import { useWebSocketStore } from '@/stores/websocket'
import type { Obra } from '@/types/obra.types'
import type { Gasto, PaginationMeta } from '@/types/gasto.types'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useGastosStore } from '@/stores/gastosStore'
// Refs
const route = useRoute()
const router = useRouter()
const pdfContent = ref<HTMLElement | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const dashboardData = ref<DashboardData | null>(null)
const obraData = ref<Obra | null>(null)
const showPdfModal = ref(false)

// Estado para os gastos
const isLoadingGastos = ref(false)
const currentPage = ref(1)

const dashboardStore = useDashboardStore()
const notificationStore = useNotificationStore()
const gastosStore = useGastosStore()
const webSocketStore = useWebSocketStore()
const pdfWebSocket = usePdfWebSocket()

// Computed para facilitar acesso ao estado de geração do PDF
const isGenerating = computed(() => pdfWebSocket.isGenerating.value)
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

// Método para gerar PDF usando WebSocket para monitoramento em tempo real
const generatePDF = async () => {
  // Verificar se já está gerando um PDF
  if (pdfWebSocket.isGenerating.value) {
    console.log('[PDF Debug] Tentativa de gerar PDF enquanto já está em andamento')
    return
  }
  
  // Garantir que o estado esteja limpo antes de iniciar
  pdfWebSocket.stopMonitoring()
  
  try {
    console.log('[PDF Debug] Iniciando geração de PDF')
    
    // 1. Verificar se o WebSocket está conectado
    if (!webSocketStore.isConnected) {
      console.log('[PDF Debug] WebSocket não conectado, tentando conectar')
      await webSocketStore.connect()
    }
    
    // 2. Inicializar os listeners do WebSocket para eventos de PDF
    pdfWebSocket.initializePdfListeners()
    
    // 3. Solicitar a geração do PDF
    const response = await pdfReportService.solicitarRelatorioPDF(dashboardStore.filtros)
    
    if (!response.job_id) {
      throw new Error('Não foi possível iniciar a geração do PDF')
    }
    
    console.log('[PDF Debug] Job ID recebido:', response.job_id)
    
    // 4. Iniciar o monitoramento do job via WebSocket
    pdfWebSocket.startMonitoring(response.job_id)
    
    // 5. Mostrar o modal de progresso
    showPdfModal.value = true
    
    // Notificação inicial
    notificationStore.addNotification('Geração de PDF iniciada', 'info')
  } catch (error) {
    console.error('Erro ao solicitar geração de PDF:', error)
    notificationStore.addNotification('Erro ao iniciar geração do PDF. Tente novamente.', 'error')
    // Garantir que o estado seja limpo em caso de erro
    pdfWebSocket.stopMonitoring()
  }
}

// Função para cancelar a geração do PDF
const cancelPdfGeneration = async () => {
  try {
    if (pdfWebSocket.pdfJobState.jobId) {
      await pdfReportService.cancelarRelatorio(pdfWebSocket.pdfJobState.jobId)
      pdfWebSocket.stopMonitoring()
      showPdfModal.value = false
      notificationStore.addNotification('Geração de PDF cancelada', 'info')
    }
  } catch (error) {
    console.error('Erro ao cancelar geração de PDF:', error)
    notificationStore.addNotification('Erro ao cancelar o PDF', 'error')
  }
}

// Função para fechar o modal e limpar o estado quando necessário
const handleCloseModal = () => {
  // Se o PDF foi gerado com sucesso, não limpar o estado para permitir download
  if (!pdfWebSocket.isCompleted.value) {
    pdfWebSocket.stopMonitoring()
  }
  showPdfModal.value = false
}

// Função para iniciar download do PDF quando estiver pronto
const handleDownloadPdf = () => {
  if (pdfWebSocket.pdfJobState.filename) {
    // Usar o novo método getDownloadUrl para obter a URL correta de download
    const downloadUrl = pdfReportService.getDownloadUrl(pdfWebSocket.pdfJobState.filename)
    console.log('[PDF Download] URL de download:', downloadUrl)
    window.open(downloadUrl, '_blank')
  } else if (pdfWebSocket.pdfJobState.downloadUrl) {
    // Fallback para compatibilidade
    console.log('[PDF Download] Usando URL direta:', pdfWebSocket.pdfJobState.downloadUrl)
    window.open(pdfWebSocket.pdfJobState.downloadUrl, '_blank')
  } else {
    console.error('[PDF Download] Nenhum arquivo disponível para download')
    notificationStore.addNotification('Arquivo PDF não disponível para download', 'error')
  }
}

// Função para tentar novamente em caso de falha
const handleRetryPdf = () => {
  pdfWebSocket.stopMonitoring()
  showPdfModal.value = false
  // Pequeno timeout para garantir que tudo foi limpo antes de tentar novamente
  setTimeout(() => {
    generatePDF()
  }, 500)
}

// Inicializar o carregamento dos dados
onMounted(async () => {
  if (!obraId.value) {
    router.push('/obras')
    return
  }
  
  // Garantir que o estado do PDF esteja limpo ao montar o componente
  pdfWebSocket.stopMonitoring()
  showPdfModal.value = false
  
  // Conectar ao WebSocket se ainda não estiver conectado
  if (!webSocketStore.isConnected) {
    try {
      await webSocketStore.connect()
    } catch (error) {
      console.error('Erro ao conectar ao WebSocket:', error)
    }
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
