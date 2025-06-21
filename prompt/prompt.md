# Plano Frontend: Implementação WebSocket para Relatórios PDF

## 📋 Análise do Estado Atual

### ✅ **O que já existe:**
- Laravel Echo configurado (`laravel-echo`, `pusher-js` no package.json)
- WebSocket Service com Reverb configurado
- Store WebSocket (`src/stores/websocket.ts`)
- Composables WebSocket (`useWebSocket`)
- Configuração do Reverb no ambiente

### 🔄 **O que precisa ser modificado:**
- Sistema de polling atual no `ObraReportView.vue`
- Integração com eventos específicos de PDF
- Gerenciamento de estado de progresso
- Interface do usuário para progresso em tempo real

---

## 🏗️ Implementação - Passo a Passo

### **Etapa 1: Atualizar Configuração WebSocket**

#### 1.1 Verificar configuração do Laravel Echo
**Arquivo**: `src/services/websocket/config.ts`

**Modificações necessárias:**
```typescript
// Verificar se as configurações estão corretas para o backend
export const createWebSocketConfig = (): WebSocketConfig => ({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY || 'demo_key', // Confirmar se é demo_key
  wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
  wsPort: parseInt(import.meta.env.VITE_REVERB_PORT || '8087', 10), // Mudar de 6001 para 8087
  // ... resto da configuração
})
```

**Ação**: Atualizar a porta para 8087 conforme mostrado no comando wscat

#### 1.2 Verificar variáveis de ambiente
**Arquivo**: `.env` (raiz do projeto Vue)
```env
VITE_REVERB_APP_KEY=demo_key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8087
VITE_REVERB_SCHEME=ws
```

### **Etapa 2: Criar Types para Eventos PDF**

#### 2.1 Criar tipos específicos para PDF
**Arquivo**: `src/types/pdf-events.types.ts` (CRIAR)
```typescript
export interface PdfGenerationStartedEvent {
  job_id: string
  filename: string
  report_type: string
  status: 'started'
  timestamp: string
  message: string
}

export interface PdfGenerationProgressEvent {
  job_id: string
  progress: number
  current_step: string
  status: 'processing'
  timestamp: string
}

export interface PdfGenerationCompletedEvent {
  job_id: string
  filename: string
  download_url: string
  file_size: number
  file_size_formatted: string
  status: 'completed'
  timestamp: string
  message: string
}

export interface PdfGenerationFailedEvent {
  job_id: string
  error_message: string
  retry_count: number
  can_retry: boolean
  status: 'failed'
  timestamp: string
  message: string
}

export type PdfEvent = 
  | PdfGenerationStartedEvent 
  | PdfGenerationProgressEvent 
  | PdfGenerationCompletedEvent 
  | PdfGenerationFailedEvent

export interface PdfJobState {
  jobId: string | null
  status: 'idle' | 'started' | 'processing' | 'completed' | 'failed'
  progress: number
  currentStep: string
  filename: string | null
  downloadUrl: string | null
  errorMessage: string | null
  canRetry: boolean
  fileSize: number | null
  fileSizeFormatted: string | null
}
```

### **Etapa 3: Criar Composable para PDF WebSocket**

#### 3.1 Criar composable `usePdfWebSocket`
**Arquivo**: `src/composables/usePdfWebSocket.ts` (CRIAR)
```typescript
import { ref, reactive, computed, onUnmounted } from 'vue'
import { useWebSocketStore } from '@/stores/websocket'
import { useAuthStore } from '@/stores/auth'
import type { PdfJobState, PdfEvent } from '@/types/pdf-events.types'
import { logger } from '@/utils/logger'

export function usePdfWebSocket() {
  const webSocketStore = useWebSocketStore()
  const authStore = useAuthStore()
  
  // Estado reativo do job PDF
  const pdfJobState = reactive<PdfJobState>({
    jobId: null,
    status: 'idle',
    progress: 0,
    currentStep: '',
    filename: null,
    downloadUrl: null,
    errorMessage: null,
    canRetry: false,
    fileSize: null,
    fileSizeFormatted: null
  })

  // Lista de jobs ativos (para múltiplos PDFs simultâneos)
  const activeJobs = ref<Map<string, PdfJobState>>(new Map())

  // Computed para canal do usuário
  const userChannel = computed(() => {
    const userId = authStore.user?.id
    return userId ? `pdf.${userId}` : null
  })

  // Função para inicializar listeners
  const initializePdfListeners = () => {
    if (!userChannel.value || !webSocketStore.isConnected) {
      logger.warn('Cannot initialize PDF listeners: no user channel or not connected')
      return
    }

    // Listener para evento de início
    webSocketStore.subscribe(
      userChannel.value,
      'pdf.generation.started',
      handlePdfStarted
    )

    // Listener para progresso
    webSocketStore.subscribe(
      userChannel.value,
      'pdf.generation.progress',
      handlePdfProgress
    )

    // Listener para conclusão
    webSocketStore.subscribe(
      userChannel.value,
      'pdf.generation.completed',
      handlePdfCompleted
    )

    // Listener para falha
    webSocketStore.subscribe(
      userChannel.value,
      'pdf.generation.failed',
      handlePdfFailed
    )

    logger.info(`PDF WebSocket listeners initialized for channel: ${userChannel.value}`)
  }

  // Handlers para eventos
  const handlePdfStarted = (event: PdfGenerationStartedEvent) => {
    logger.info('PDF generation started:', event)
    updateJobState(event.job_id, {
      status: 'started',
      progress: 0,
      currentStep: 'Iniciando geração...',
      filename: event.filename
    })
  }

  const handlePdfProgress = (event: PdfGenerationProgressEvent) => {
    logger.info('PDF generation progress:', event)
    updateJobState(event.job_id, {
      status: 'processing',
      progress: event.progress,
      currentStep: event.current_step
    })
  }

  const handlePdfCompleted = (event: PdfGenerationCompletedEvent) => {
    logger.info('PDF generation completed:', event)
    updateJobState(event.job_id, {
      status: 'completed',
      progress: 100,
      currentStep: 'Concluído',
      downloadUrl: event.download_url,
      fileSize: event.file_size,
      fileSizeFormatted: event.file_size_formatted
    })
  }

  const handlePdfFailed = (event: PdfGenerationFailedEvent) => {
    logger.error('PDF generation failed:', event)
    updateJobState(event.job_id, {
      status: 'failed',
      errorMessage: event.error_message,
      canRetry: event.can_retry
    })
  }

  // Função para atualizar estado do job
  const updateJobState = (jobId: string, updates: Partial<PdfJobState>) => {
    // Atualizar job ativo no Map
    const currentJob = activeJobs.value.get(jobId)
    if (currentJob) {
      Object.assign(currentJob, updates)
    } else {
      activeJobs.value.set(jobId, { ...pdfJobState, jobId, ...updates })
    }

    // Se for o job atual, atualizar o estado principal
    if (pdfJobState.jobId === jobId) {
      Object.assign(pdfJobState, updates)
    }
  }

  // Função para iniciar monitoramento de um job
  const startMonitoring = (jobId: string) => {
    pdfJobState.jobId = jobId
    pdfJobState.status = 'started'
    pdfJobState.progress = 0
    pdfJobState.currentStep = 'Aguardando início...'
    pdfJobState.errorMessage = null
    pdfJobState.downloadUrl = null

    // Adicionar aos jobs ativos
    activeJobs.value.set(jobId, { ...pdfJobState })

    // Garantir que os listeners estão ativos
    if (webSocketStore.isConnected) {
      initializePdfListeners()
    }
  }

  // Função para parar monitoramento
  const stopMonitoring = () => {
    if (pdfJobState.jobId) {
      activeJobs.value.delete(pdfJobState.jobId)
    }
    
    // Reset do estado
    Object.assign(pdfJobState, {
      jobId: null,
      status: 'idle',
      progress: 0,
      currentStep: '',
      filename: null,
      downloadUrl: null,
      errorMessage: null,
      canRetry: false,
      fileSize: null,
      fileSizeFormatted: null
    })
  }

  // Cleanup ao desmontar
  onUnmounted(() => {
    if (userChannel.value) {
      webSocketStore.unsubscribe(userChannel.value, 'pdf.generation.started')
      webSocketStore.unsubscribe(userChannel.value, 'pdf.generation.progress')
      webSocketStore.unsubscribe(userChannel.value, 'pdf.generation.completed')
      webSocketStore.unsubscribe(userChannel.value, 'pdf.generation.failed')
    }
  })

  // Computed properties
  const isGenerating = computed(() => 
    pdfJobState.status === 'started' || pdfJobState.status === 'processing'
  )

  const isCompleted = computed(() => pdfJobState.status === 'completed')
  const isFailed = computed(() => pdfJobState.status === 'failed')
  const canDownload = computed(() => isCompleted.value && pdfJobState.downloadUrl)

  return {
    // Estado
    pdfJobState: readonly(pdfJobState),
    activeJobs: readonly(activeJobs),
    
    // Computed
    isGenerating,
    isCompleted,
    isFailed,
    canDownload,
    
    // Métodos
    initializePdfListeners,
    startMonitoring,
    stopMonitoring
  }
}
```

### **Etapa 4: Atualizar Serviço de Relatórios**

#### 4.1 Modificar `dashboardService` ou criar `pdfReportService`
**Arquivo**: `src/services/pdfReportService.ts` (CRIAR)
```typescript
import api from '@/services/api'
import type { DashboardFiltros } from '@/types/dashboard.types'

export interface PdfReportResponse {
  message: string
  job_id: string
  filename: string
  status: string
  websocket_channel: string
}

export const pdfReportService = {
  /**
   * Solicitar geração de relatório PDF via WebSocket
   */
  async solicitarRelatorioPDF(filtros: DashboardFiltros): Promise<PdfReportResponse> {
    try {
      const response = await api.post<PdfReportResponse>('/relatorios/gastos', {
        data_inicio: filtros.dataInicio,
        data_fim: filtros.dataFim,
        obras: filtros.obras,
        categorias_gasto: filtros.categorias_gasto
      })
      return response.data
    } catch (error) {
      console.error('Erro ao solicitar relatório PDF:', error)
      throw error
    }
  },

  /**
   * Cancelar geração de relatório
   */
  async cancelarRelatorio(jobId: string): Promise<{ message: string }> {
    try {
      const response = await api.delete('/relatorios/cancelar', {
        data: { job_id: jobId }
      })
      return response.data
    } catch (error) {
      console.error('Erro ao cancelar relatório:', error)
      throw error
    }
  },

  /**
   * Verificar status (fallback)
   */
  async verificarStatus(jobId: string): Promise<any> {
    try {
      const response = await api.get(`/relatorios/status/${jobId}`)
      return response.data
    } catch (error) {
      console.error('Erro ao verificar status:', error)
      throw error
    }
  }
}
```

### **Etapa 5: Criar Componente de Progresso**

#### 5.1 Criar componente `PdfProgressModal`
**Arquivo**: `src/components/pdf/PdfProgressModal.vue` (CRIAR)
```vue
<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button 
          v-if="canClose" 
          @click="$emit('close')" 
          class="close-button"
        >
          ×
        </button>
      </div>
      
      <div class="modal-body">
        <!-- Status de acordo com o estado -->
        <div v-if="pdfState.status === 'idle'" class="status-idle">
          <div class="icon">📄</div>
          <p>Pronto para gerar relatório</p>
        </div>

        <div v-else-if="pdfState.status === 'started'" class="status-started">
          <div class="spinner"></div>
          <p>Iniciando geração do relatório...</p>
          <small>Job ID: {{ pdfState.jobId }}</small>
        </div>

        <div v-else-if="pdfState.status === 'processing'" class="status-processing">
          <div class="progress-container">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: `${pdfState.progress}%` }"
              ></div>
            </div>
            <span class="progress-text">{{ pdfState.progress }}%</span>
          </div>
          <p class="current-step">{{ pdfState.currentStep }}</p>
          <small>Job ID: {{ pdfState.jobId }}</small>
        </div>

        <div v-else-if="pdfState.status === 'completed'" class="status-completed">
          <div class="icon success">✅</div>
          <p><strong>Relatório gerado com sucesso!</strong></p>
          <div class="file-info">
            <p><strong>Arquivo:</strong> {{ pdfState.filename }}</p>
            <p v-if="pdfState.fileSizeFormatted">
              <strong>Tamanho:</strong> {{ pdfState.fileSizeFormatted }}
            </p>
          </div>
          <button 
            @click="downloadPdf" 
            class="download-button"
            :disabled="!pdfState.downloadUrl"
          >
            📥 Baixar PDF
          </button>
        </div>

        <div v-else-if="pdfState.status === 'failed'" class="status-failed">
          <div class="icon error">❌</div>
          <p><strong>Falha na geração do relatório</strong></p>
          <p class="error-message">{{ pdfState.errorMessage }}</p>
          <button 
            v-if="pdfState.canRetry" 
            @click="$emit('retry')" 
            class="retry-button"
          >
            🔄 Tentar Novamente
          </button>
        </div>
      </div>

      <!-- Footer com ações -->
      <div class="modal-footer">
        <button 
          v-if="isGenerating" 
          @click="$emit('cancel')" 
          class="cancel-button"
        >
          Cancelar
        </button>
        <button 
          v-if="canClose" 
          @click="$emit('close')" 
          class="close-action-button"
        >
          Fechar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PdfJobState } from '@/types/pdf-events.types'

interface Props {
  show: boolean
  pdfState: PdfJobState
}

interface Emits {
  (e: 'close'): void
  (e: 'cancel'): void
  (e: 'retry'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isGenerating = computed(() => 
  props.pdfState.status === 'started' || props.pdfState.status === 'processing'
)

const canClose = computed(() => 
  props.pdfState.status === 'idle' || 
  props.pdfState.status === 'completed' || 
  props.pdfState.status === 'failed'
)

const title = computed(() => {
  switch (props.pdfState.status) {
    case 'idle': return 'Gerar Relatório PDF'
    case 'started': return 'Preparando Relatório'
    case 'processing': return 'Gerando Relatório'
    case 'completed': return 'Relatório Concluído'
    case 'failed': return 'Erro na Geração'
    default: return 'Relatório PDF'
  }
})

const downloadPdf = () => {
  if (props.pdfState.downloadUrl) {
    window.open(props.pdfState.downloadUrl, '_blank')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: #f3f4f6;
}

.modal-body {
  padding: 0 24px 20px;
  text-align: center;
}

.icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.progress-container {
  margin: 20px 0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background-color: #3b82f6;
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-text {
  font-weight: 600;
  color: #1f2937;
}

.current-step {
  color: #6b7280;
  font-size: 14px;
  margin: 8px 0;
}

.file-info {
  background-color: #f3f4f6;
  padding: 16px;
  border-radius: 8px;
  margin: 16px 0;
  text-align: left;
}

.error-message {
  color: #ef4444;
  background-color: #fee2e2;
  padding: 12px;
  border-radius: 6px;
  margin: 16px 0;
  font-size: 14px;
}

.download-button, .retry-button {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin: 8px;
}

.download-button:hover, .retry-button:hover {
  background-color: #2563eb;
}

.retry-button {
  background-color: #f59e0b;
}

.retry-button:hover {
  background-color: #d97706;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-button, .close-action-button {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-button {
  background-color: #ef4444;
  color: white;
  border: none;
}

.cancel-button:hover {
  background-color: #dc2626;
}

.close-action-button {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.close-action-button:hover {
  background-color: #e5e7eb;
}

small {
  color: #6b7280;
  font-size: 12px;
}
</style>
```

### **Etapa 6: Modificar ObraReportView**

#### 6.1 Integrar WebSocket no `ObraReportView.vue`
**Arquivo**: `src/views/obras/ObraReportView.vue`

**Modificações na seção `<script setup>`:**
```typescript
// Adicionar imports
import { usePdfWebSocket } from '@/composables/usePdfWebSocket'
import { useWebSocketStore } from '@/stores/websocket'
import { pdfReportService } from '@/services/pdfReportService'
import PdfProgressModal from '@/components/pdf/PdfProgressModal.vue'

// Substituir refs de PDF existentes
const {
  pdfJobState,
  isGenerating,
  isCompleted,
  isFailed,
  canDownload,
  initializePdfListeners,
  startMonitoring,
  stopMonitoring
} = usePdfWebSocket()

const webSocketStore = useWebSocketStore()
const showPdfModal = ref(false)

// Substituir função generatePDF
const generatePDF = async () => {
  if (isGenerating.value) return
  
  try {
    // 1. Garantir conexão WebSocket
    if (!webSocketStore.isConnected) {
      await webSocketStore.connect()
      await new Promise(resolve => setTimeout(resolve, 1000)) // Aguardar conexão
    }

    // 2. Solicitar geração do PDF
    const response = await pdfReportService.solicitarRelatorioPDF(dashboardStore.filtros)
    
    // 3. Iniciar monitoramento WebSocket
    startMonitoring(response.job_id)
    
    // 4. Mostrar modal de progresso
    showPdfModal.value = true
    
    notificationStore.addNotification('Relatório sendo gerado...', 'info')
    
  } catch (error) {
    console.error('Erro ao solicitar PDF:', error)
    notificationStore.addNotification('Erro ao solicitar relatório PDF', 'error')
  }
}

// Função para cancelar
const cancelPdfGeneration = async () => {
  if (!pdfJobState.jobId) return
  
  try {
    await pdfReportService.cancelarRelatorio(pdfJobState.jobId)
    stopMonitoring()
    showPdfModal.value = false
    notificationStore.addNotification('Geração de PDF cancelada', 'info')
  } catch (error) {
    console.error('Erro ao cancelar PDF:', error)
    notificationStore.addNotification('Erro ao cancelar relatório', 'error')
  }
}

// Função para retry
const retryPdfGeneration = () => {
  stopMonitoring()
  generatePDF()
}

// Função para fechar modal
const closePdfModal = () => {
  if (!isGenerating.value) {
    showPdfModal.value = false
    stopMonitoring()
  }
}

// Inicializar WebSocket listeners quando componente é montado
onMounted(async () => {
  // ... código existente ...
  
  // Conectar WebSocket se não estiver conectado
  if (!webSocketStore.isConnected) {
    await webSocketStore.connect()
  }
  
  // Inicializar listeners
  initializePdfListeners()
})
```

**Modificações no template:**
```vue
<template>
  <div class="obra-report-container">
    <!-- PDF Controls -->
    <div class="pdf-controls">
      <button 
        @click="generatePDF" 
        :disabled="isGenerating" 
        class="pdf-button"
      >
        <span v-if="isGenerating">Gerando PDF...</span>
        <span v-else>📄 Gerar PDF</span>
      </button>
      
      <!-- Indicador de conexão WebSocket -->
      <div class="websocket-status">
        <span 
          :class="['status-indicator', { 
            'connected': webSocketStore.isConnected,
            'disconnected': !webSocketStore.isConnected 
          }]"
        ></span>
        <small>
          {{ webSocketStore.isConnected ? 'WebSocket conectado' : 'WebSocket desconectado' }}
        </small>
      </div>
    </div>
    
    <!-- Modal de Progresso PDF -->
    <PdfProgressModal
      :show="showPdfModal"
      :pdf-state="pdfJobState"
      @close="closePdfModal"
      @cancel="cancelPdfGeneration"
      @retry="retryPdfGeneration"
    />
    
    <!-- Resto do template existente -->
    <!-- ... -->
  </div>
</template>
```

### **Etapa 7: Atualizar Estilos**

#### 7.1 Adicionar estilos para WebSocket status
**No arquivo**: `src/views/obras/ObraReportView.vue`

```scss
.pdf-controls {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  
  .websocket-status {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      
      &.connected {
        background-color: #10b981;
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
      }
      
      &.disconnected {
        background-color: #ef4444;
        box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
      }
    }
    
    small {
      color: #6b7280;
      font-size: 12px;
    }
  }
}
```

## 📊 **Fluxo Final Esperado**

1. **Usuário clica em "Gerar PDF"**
2. **Frontend solicita PDF via API** → Recebe `job_id`
3. **Frontend inicia monitoramento WebSocket** → Subscreve canal `private-pdf.{user_id}`
4. **Modal de progresso é exibido** → Estado "Preparando..."
5. **Backend dispara eventos WebSocket** → `pdf.generation.started`
6. **Frontend recebe progresso** → `pdf.generation.progress` (25%, 50%, 75%, 100%)
7. **Backend conclui geração** → `pdf.generation.completed`
8. **Frontend mostra download** → Botão "Baixar PDF" disponível
9. **Usuário baixa arquivo** → Processo concluído

### **Em caso de erro:**
- **Backend dispara** → `pdf.generation.failed`
- **Frontend mostra erro** → Opção de retry se disponível
- **Usuário pode tentar novamente** → Reinicia processo

---
Este planejamento fornece uma implementação completa e robusta do WebSocket para relatórios PDF, substituindo o sistema de polling atual por notificações em tempo real.

O agente deve implementar os passos acima e se manter no escopo da tarefa, ou seja, ele não deve implementar mais coisas que não estão no checklist acima.
qualque duvida de como agir deve ser perguntada ao usuario.