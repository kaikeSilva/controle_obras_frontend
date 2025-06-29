import { ref, reactive, computed, readonly, onUnmounted } from 'vue'
import { useWebSocketStore } from '@/stores/websocket'
import { useAuthStore } from '@/stores/auth'
import type { PdfJobState, PdfEvent, PdfGenerationStartedEvent, PdfGenerationProgressEvent, PdfGenerationCompletedEvent, PdfGenerationFailedEvent } from '@/types/pdf-events.types'
import { logger } from '@/utils/logger'

export function usePdfWebSocket() {
  const webSocketStore = useWebSocketStore()
  const authStore = useAuthStore()
  
  // Estado inicial padrão
  const defaultState: PdfJobState = {
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
  }
  
  // Estado reativo do job PDF
  const pdfJobState = reactive<PdfJobState>({ ...defaultState })

  // Lista de jobs ativos (para múltiplos PDFs simultâneos)
  const activeJobs = ref<Map<string, PdfJobState>>(new Map())

  // Computed para canal do usuário
  const userChannel = computed(() => {
    const userId = authStore.user?.id
    return userId ? `pdf.${userId}` : null
  })

  // Função para inicializar listeners
  const initializePdfListeners = () => {
    console.log('[PDF WebSocket Debug] Tentando inicializar listeners', {
      userChannel: userChannel.value,
      isConnected: webSocketStore.isConnected,
      socketId: webSocketStore.socketId,
      authUser: authStore.user?.id
    })
    
    if (!userChannel.value || !webSocketStore.isConnected) {
      logger.warn('Cannot initialize PDF listeners: no user channel or not connected')
      console.error('[PDF WebSocket Debug] Falha ao inicializar listeners', {
        userChannel: userChannel.value,
        isConnected: webSocketStore.isConnected
      })
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
    console.log('[PDF WebSocket Debug] Evento STARTED recebido:', event)
    updateJobState(event.job_id, {
      status: 'started',
      progress: 0,
      currentStep: 'Iniciando geração...',
      filename: event.filename
    })
    console.log('[PDF WebSocket Debug] Estado atualizado após STARTED:', { ...pdfJobState })
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
    console.log('[PDF WebSocket Debug] Iniciando monitoramento do job:', jobId, {
      isConnected: webSocketStore.isConnected,
      socketId: webSocketStore.socketId
    })
    
    pdfJobState.jobId = jobId
    pdfJobState.status = 'started'
    pdfJobState.progress = 0
    pdfJobState.currentStep = 'Aguardando início...'
    pdfJobState.errorMessage = null
    pdfJobState.downloadUrl = null

    // Adicionar aos jobs ativos
    activeJobs.value.set(jobId, { ...pdfJobState })
    console.log('[PDF WebSocket Debug] Job adicionado aos ativos:', {
      jobId,
      activeJobs: Array.from(activeJobs.value.keys())
    })

    // Garantir que os listeners estão ativos
    if (webSocketStore.isConnected) {
      console.log('[PDF WebSocket Debug] WebSocket conectado, inicializando listeners')
      initializePdfListeners()
    } else {
      console.warn('[PDF WebSocket Debug] WebSocket não conectado ao iniciar monitoramento')
    }
  }

  // Função para parar monitoramento
  const stopMonitoring = () => {
    console.log('[PDF WebSocket Debug] Parando monitoramento', { 
      currentJobId: pdfJobState.jobId,
      currentStatus: pdfJobState.status 
    })
    
    if (pdfJobState.jobId) {
      activeJobs.value.delete(pdfJobState.jobId)
    }
    
    // Reset completo do estado usando o estado padrão
    Object.assign(pdfJobState, { ...defaultState })
    
    console.log('[PDF WebSocket Debug] Estado resetado', { ...pdfJobState })
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
