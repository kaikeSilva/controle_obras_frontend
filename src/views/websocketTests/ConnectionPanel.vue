<template>
  <div class="card">
    <h2>Configuração de Conexão</h2>
    
    <div class="form-group">
      <label for="host">Host:</label>
      <input 
        type="text" 
        id="host" 
        v-model="config.host" 
        placeholder="localhost"
        class="form-control"
      />
    </div>
    
    <div class="form-group">
      <label for="port">Porta:</label>
      <input 
        type="number" 
        id="port" 
        v-model="config.port" 
        placeholder="8087"
        class="form-control"
      />
    </div>
    
    <div class="form-group">
      <label for="scheme">Esquema:</label>
      <select id="scheme" v-model="config.scheme" class="form-control">
        <option value="ws">ws (WebSocket)</option>
        <option value="wss">wss (WebSocket Seguro)</option>
      </select>
    </div>
    
    <div class="form-group">
      <label for="key">App Key:</label>
      <input 
        type="text" 
        id="key" 
        v-model="config.key" 
        placeholder="demo_key"
        class="form-control"
      />
    </div>
    
    <div class="form-group">
      <label for="token">Token de Autenticação:</label>
      <input 
        type="text" 
        id="token" 
        v-model="authToken" 
        placeholder="Bearer token..."
        class="form-control"
      />
    </div>
    
    <div class="form-actions">
      <button 
        @click="connectWebSocket" 
        :disabled="isConnecting"
        class="btn btn-primary"
      >
        {{ isConnected ? 'Reconectar' : 'Conectar' }}
      </button>
      
      <button 
        @click="disconnectWebSocket" 
        :disabled="!isConnected || isDisconnecting"
        class="btn btn-secondary"
      >
        Desconectar
      </button>
    </div>

    <div v-if="isConnected || connectionError" class="status-container mt-3">
      <h3>Status da Conexão</h3>
      
      <div class="status-indicator" :class="statusClass">
        <div class="status-dot"></div>
        <div class="status-text">{{ statusMessage }}</div>
      </div>
      
      <div v-if="socketId" class="socket-id">
        Socket ID: <code>{{ socketId }}</code>
      </div>
      
      <div v-if="connectionError" class="error-message">
        {{ connectionError }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onUnmounted } from 'vue'
import { WebSocketService } from '@/services/websocket/WebSocketService'
import { createWebSocketConfig } from '@/services/websocket/config'
import { eventBus } from '@/utils/events'
import { logger } from '@/utils/logger'

// Estado de configuração
const config = reactive({
  host: 'localhost',
  port: 8087,
  scheme: 'ws',
  key: 'demo_key'
})

// Estado de autenticação
const authToken = ref(localStorage.getItem('auth_token') || '')

// Estado de conexão
const isConnected = ref(false)
const isConnecting = ref(false)
const isDisconnecting = ref(false)
const socketId = ref<string | null>(null)
const connectionError = ref<string | null>(null)

// Instância do serviço WebSocket
let wsService: WebSocketService | null = null

// Emits para comunicação com o componente pai
const emit = defineEmits(['connected', 'disconnected', 'error', 'socket-id-changed'])

// Computed para classe de status
const statusClass = computed(() => {
  if (connectionError.value) return 'status-error'
  if (isConnected.value) return 'status-connected'
  return 'status-disconnected'
})

// Computed para mensagem de status
const statusMessage = computed(() => {
  if (connectionError.value) return 'Erro de Conexão'
  if (isConnecting.value) return 'Conectando...'
  if (isDisconnecting.value) return 'Desconectando...'
  if (isConnected.value) return 'Conectado'
  return 'Desconectado'
})

// Método para conectar ao WebSocket
const connectWebSocket = async () => {
  try {
    isConnecting.value = true
    connectionError.value = null
    
    // Criar configuração personalizada
    const wsConfig = createWebSocketConfig()
    wsConfig.wsHost = config.host
    wsConfig.wsPort = Number(config.port)
    wsConfig.wssPort = Number(config.port)
    wsConfig.forceTLS = config.scheme === 'wss'
    wsConfig.key = config.key
    
    // Adicionar token de autenticação se fornecido
    if (authToken.value) {
      wsConfig.auth = {
        headers: {
          Authorization: authToken.value.startsWith('Bearer ') 
            ? authToken.value 
            : `Bearer ${authToken.value}`
        }
      }
    }
    
    // Criar e inicializar serviço
    wsService = new WebSocketService(wsConfig, eventBus, logger)
    
    // Configurar listeners de eventos
    setupEventListeners()
    
    // Conectar
    await wsService.connect()
    
    // Emitir evento para o componente pai
    emit('connected', wsService)
    
  } catch (error) {
    connectionError.value = error instanceof Error ? error.message : 'Erro desconhecido ao conectar'
    console.error('Erro ao conectar:', error)
    emit('error', error)
  } finally {
    isConnecting.value = false
  }
}

// Método para desconectar do WebSocket
const disconnectWebSocket = () => {
  if (!wsService) return
  
  try {
    isDisconnecting.value = true
    wsService.disconnect()
    
    // Resetar estado
    isConnected.value = false
    socketId.value = null
    
    // Emitir evento para o componente pai
    emit('disconnected')
    
  } catch (error) {
    console.error('Erro ao desconectar:', error)
  } finally {
    isDisconnecting.value = false
  }
}

// Configurar listeners de eventos
const setupEventListeners = () => {
  eventBus.on('ws:connected', ({ socketId: id }) => {
    isConnected.value = true
    socketId.value = id
    connectionError.value = null
    console.log('WebSocket conectado com ID:', id)
    emit('socket-id-changed', id)
  })
  
  eventBus.on('ws:disconnected', () => {
    isConnected.value = false
    socketId.value = null
    console.log('WebSocket desconectado')
  })
  
  eventBus.on('ws:error', (error) => {
    connectionError.value = error instanceof Error ? error.message : 'Erro na conexão WebSocket'
    console.error('Erro WebSocket:', error)
    emit('error', error)
  })
}

// Limpar listeners de eventos
const cleanupEventListeners = () => {
  eventBus.off('ws:connected')
  eventBus.off('ws:disconnected')
  eventBus.off('ws:error')
}

// Lifecycle hooks
onUnmounted(() => {
  // Limpar recursos
  if (wsService) {
    wsService.disconnect()
  }
  
  cleanupEventListeners()
})

// Expor métodos e propriedades para o componente pai
defineExpose({
  connectWebSocket,
  disconnectWebSocket,
  isConnected,
  socketId,
  wsService
})
</script>

<style scoped lang="scss">
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
  
  h2, h3 {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 1.25rem;
    color: #333;
  }
}

.form-group {
  margin-bottom: 15px;
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
  }
  
  .form-control {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: #4a90e2;
      box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
    }
  }
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  
  .btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    &.btn-primary {
      background-color: #4a90e2;
      color: white;
      
      &:hover:not(:disabled) {
        background-color: #3a80d2;
      }
    }
    
    &.btn-secondary {
      background-color: #f5f5f5;
      color: #333;
      
      &:hover:not(:disabled) {
        background-color: #e5e5e5;
      }
    }
  }
}

.status-container {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.status-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  
  &.status-connected {
    .status-dot {
      background-color: #4caf50;
    }
    .status-text {
      color: #4caf50;
    }
  }
  
  &.status-disconnected {
    .status-dot {
      background-color: #9e9e9e;
    }
    .status-text {
      color: #9e9e9e;
    }
  }
  
  &.status-error {
    .status-dot {
      background-color: #f44336;
    }
    .status-text {
      color: #f44336;
    }
  }
  
  .status-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 8px;
  }
  
  .status-text {
    font-weight: 500;
  }
}

.socket-id {
  margin-top: 10px;
  font-size: 14px;
  
  code {
    background-color: #f5f5f5;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: monospace;
  }
}

.error-message {
  margin-top: 10px;
  padding: 10px;
  background-color: #ffebee;
  border-left: 4px solid #f44336;
  color: #b71c1c;
  font-size: 14px;
  border-radius: 4px;
}

.mt-3 {
  margin-top: 15px;
}
</style>
