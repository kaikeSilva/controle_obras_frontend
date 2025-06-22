<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button 
          v-if="canClose" 
          @click="$emit('close')" 
          class="close-button"
          aria-label="Fechar"
        >
          <span>&times;</span>
        </button>
      </div>
      
      <div class="modal-body">
        <!-- Status atual -->
        <div class="status-container">
          <div class="status-icon" :class="statusIconClass">
            <i :class="statusIcon"></i>
          </div>
          <div class="status-text">
            <p class="status-message">{{ statusMessage }}</p>
            <p v-if="pdfState.currentStep" class="current-step">{{ pdfState.currentStep }}</p>
          </div>
        </div>
        
        <!-- Barra de progresso -->
        <div v-if="isGenerating" class="progress-container">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${pdfState.progress}%` }"
            ></div>
          </div>
          <div class="progress-text">{{ pdfState.progress }}%</div>
        </div>
        
        <!-- Informações do arquivo quando concluído -->
        <div v-if="isCompleted" class="file-info">
          <p class="filename">
            <i class="fas fa-file-pdf"></i> {{ pdfState.filename }}
          </p>
          <p v-if="pdfState.fileSizeFormatted" class="file-size">
            Tamanho: {{ pdfState.fileSizeFormatted }}
          </p>
        </div>
        
        <!-- Mensagem de erro -->
        <div v-if="isFailed" class="error-container">
          <p class="error-message">{{ pdfState.errorMessage }}</p>
        </div>
      </div>
      
      <div class="modal-footer">
        <!-- Botão de cancelar (durante geração) -->
        <button 
          v-if="isGenerating && showCancelButton" 
          @click="$emit('cancel')" 
          class="btn btn-secondary"
        >
          Cancelar
        </button>
        
        <!-- Botão de download (quando concluído) -->
        <a 
          v-if="canDownload" 
          :href="pdfState.downloadUrl" 
          target="_blank"
          class="btn btn-primary"
          download
        >
          Download PDF
        </a>
        
        <!-- Botão de tentar novamente (quando falhou) -->
        <button 
          v-if="isFailed && pdfState.canRetry" 
          @click="$emit('retry')" 
          class="btn btn-warning"
        >
          Tentar Novamente
        </button>
        
        <!-- Botão de fechar -->
        <button 
          v-if="showCloseButton" 
          @click="$emit('close')" 
          class="btn btn-outline"
        >
          {{ closeButtonText }}
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
  title?: string
  canClose?: boolean
  showCancelButton?: boolean
  showCloseButton?: boolean
  closeButtonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Gerando Relatório PDF',
  canClose: true,
  showCancelButton: true,
  showCloseButton: true,
  closeButtonText: 'Fechar'
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'cancel'): void
  (e: 'retry'): void
}>()

// Status computados
const isGenerating = computed(() => 
  props.pdfState.status === 'started' || props.pdfState.status === 'processing'
)
const isCompleted = computed(() => props.pdfState.status === 'completed')
const isFailed = computed(() => props.pdfState.status === 'failed')
const canDownload = computed(() => isCompleted.value && props.pdfState.downloadUrl)

// Mensagem de status
const statusMessage = computed(() => {
  switch (props.pdfState.status) {
    case 'started':
      return 'Iniciando geração do PDF...'
    case 'processing':
      return 'Gerando PDF...'
    case 'completed':
      return 'PDF gerado com sucesso!'
    case 'failed':
      return 'Falha na geração do PDF'
    default:
      return 'Aguardando...'
  }
})

// Ícone de status
const statusIcon = computed(() => {
  switch (props.pdfState.status) {
    case 'started':
    case 'processing':
      return 'fas fa-spinner fa-spin'
    case 'completed':
      return 'fas fa-check-circle'
    case 'failed':
      return 'fas fa-exclamation-circle'
    default:
      return 'fas fa-file-pdf'
  }
})

// Classe CSS para o ícone
const statusIconClass = computed(() => {
  switch (props.pdfState.status) {
    case 'started':
    case 'processing':
      return 'status-processing'
    case 'completed':
      return 'status-success'
    case 'failed':
      return 'status-error'
    default:
      return ''
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 24px;
}

.status-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.status-icon {
  font-size: 2rem;
  margin-right: 16px;
}

.status-processing {
  color: #2196f3;
}

.status-success {
  color: #4caf50;
}

.status-error {
  color: #f44336;
}

.status-text {
  flex: 1;
}

.status-message {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0 0 4px 0;
}

.current-step {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.progress-container {
  margin: 20px 0;
}

.progress-bar {
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-fill {
  height: 100%;
  background-color: #2196f3;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: right;
  font-size: 0.9rem;
  color: #666;
}

.file-info {
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  margin-top: 16px;
}

.filename {
  font-weight: 500;
  margin: 0 0 4px 0;
}

.file-size {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.error-container {
  background-color: #ffebee;
  padding: 12px;
  border-radius: 4px;
  margin-top: 16px;
}

.error-message {
  color: #d32f2f;
  margin: 0;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #2196f3;
  color: white;
  text-decoration: none;
  display: inline-block;
}

.btn-primary:hover {
  background-color: #1976d2;
}

.btn-secondary {
  background-color: #9e9e9e;
  color: white;
}

.btn-secondary:hover {
  background-color: #757575;
}

.btn-warning {
  background-color: #ff9800;
  color: white;
}

.btn-warning:hover {
  background-color: #f57c00;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid #9e9e9e;
  color: #333;
}

.btn-outline:hover {
  background-color: #f5f5f5;
}
</style>
