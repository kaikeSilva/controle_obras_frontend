<template>
  <div class="websocket-test-container">
    <h1>Teste de WebSocket</h1>
    
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
    </div>
    
    <div class="card" v-if="isConnected || connectionError">
      <h2>Status da Conexão</h2>
      
      <div class="status-container" :class="statusClass">
        <div class="status-indicator"></div>
        <div class="status-text">{{ statusMessage }}</div>
      </div>
      
      <div v-if="socketId" class="socket-id">
        Socket ID: <code>{{ socketId }}</code>
      </div>
      
      <div v-if="connectionError" class="error-message">
        {{ connectionError }}
      </div>
    </div>
    
    <div class="card" v-if="isConnected">
      <h2>Teste de Canal</h2>
      
      <div class="form-group">
        <label for="channel">Canal:</label>
        <input 
          type="text" 
          id="channel" 
          v-model="channelName" 
          placeholder="private-channel-name"
          class="form-control"
        />
      </div>
      
      <div class="form-group">
        <label for="event">Evento:</label>
        <input 
          type="text" 
          id="event" 
          v-model="eventName" 
          placeholder="event-name"
          class="form-control"
        />
      </div>
      
      <div class="form-actions">
        <button 
          @click="subscribeToChannel" 
          :disabled="!channelName || !eventName || isSubscribing"
          class="btn btn-primary"
        >
          Inscrever-se
        </button>
        
        <button 
          @click="unsubscribeFromChannel" 
          :disabled="!isSubscribed || isUnsubscribing"
          class="btn btn-secondary"
        >
          Cancelar Inscrição
        </button>
      </div>
      
      <div v-if="isSubscribed" class="subscription-status">
        Inscrito em: <code>{{ channelName }}:{{ eventName }}</code>
      </div>
    </div>
    
    <div class="card" v-if="messages.length > 0">
      <h2>Mensagens Recebidas</h2>
      
      <div class="messages-container">
        <div v-for="(msg, index) in messages" :key="index" class="message-item">
          <div class="message-header">
            <span class="message-channel">{{ msg.channel }}</span>
            <span class="message-event">{{ msg.event }}</span>
            <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
          </div>
          <pre class="message-data">{{ JSON.stringify(msg.data, null, 2) }}</pre>
        </div>
      </div>
      
      <button @click="clearMessages" class="btn btn-outline">Limpar Mensagens</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { WebSocketService } from '@/services/websocket/WebSocketService'
import { createWebSocketConfig } from '@/services/websocket/config'
import { eventBus } from '@/utils/events'
import { logger } from '@/utils/logger'
import type { WebSocketMessage } from '@/services/websocket/types'

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

// Estado de canal
const channelName = ref('')
const eventName = ref('')
const isSubscribed = ref(false)
const isSubscribing = ref(false)
const isUnsubscribing = ref(false)

// Mensagens recebidas
const messages = ref<WebSocketMessage[]>([])

// Instância do serviço WebSocket
let wsService: WebSocketService | null = null

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
    
  } catch (error) {
    connectionError.value = error instanceof Error ? error.message : 'Erro desconhecido ao conectar'
    console.error('Erro ao conectar:', error)
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
    isSubscribed.value = false
    
  } catch (error) {
    console.error('Erro ao desconectar:', error)
  } finally {
    isDisconnecting.value = false
  }
}

// Método para inscrever-se em um canal
const subscribeToChannel = () => {
  if (!wsService || !channelName.value || !eventName.value) return
  
  try {
    isSubscribing.value = true
    console.log('Subscrevendo canal na tela:', channelName.value, 'evento:', eventName.value)
    wsService.subscribe(
      channelName.value, 
      eventName.value, 
      (data) => {
        console.log(`Callback direto: Mensagem recebida em ${channelName.value}:${eventName.value}`, data)
        
        // Adicionar a mensagem à lista de mensagens exibidas
        messages.value.unshift({
          id: crypto.randomUUID(),
          channel: channelName.value,
          event: eventName.value,
          data,
          timestamp: new Date()
        })
        
        // Limitar número de mensagens
        if (messages.value.length > 50) {
          messages.value = messages.value.slice(0, 50)
        }
      }
    )
    
    isSubscribed.value = true
    
  } catch (error) {
    console.error('Erro ao inscrever-se:', error)
  } finally {
    isSubscribing.value = false
  }
}

// Método para cancelar inscrição em um canal
const unsubscribeFromChannel = () => {
  if (!wsService || !channelName.value) return
  
  try {
    isUnsubscribing.value = true
    
    wsService.unsubscribe(channelName.value, eventName.value)
    
    isSubscribed.value = false
    
  } catch (error) {
    console.error('Erro ao cancelar inscrição:', error)
  } finally {
    isUnsubscribing.value = false
  }
}

// Método para limpar mensagens
const clearMessages = () => {
  messages.value = []
}

// Método para formatar timestamp
const formatTime = (timestamp: Date) => {
  return new Date(timestamp).toLocaleTimeString()
}

// Configurar listeners de eventos
const setupEventListeners = () => {
  eventBus.on('ws:connected', ({ socketId: id }) => {
    isConnected.value = true
    socketId.value = id
    connectionError.value = null
    console.log('WebSocket conectado com ID:', id)
  })
  
  eventBus.on('ws:disconnected', () => {
    isConnected.value = false
    socketId.value = null
    console.log('WebSocket desconectado')
  })
  
  eventBus.on('ws:error', (error) => {
    connectionError.value = error instanceof Error ? error.message : 'Erro na conexão WebSocket'
    console.error('Erro WebSocket:', error)
  })
}

// Limpar listeners de eventos
const cleanupEventListeners = () => {
  eventBus.off('ws:connected')
  eventBus.off('ws:disconnected')
  eventBus.off('ws:error')
  eventBus.off('ws:message')
}

// Lifecycle hooks
onMounted(() => {
  // Nada a fazer no momento do mount
})

onUnmounted(() => {
  // Limpar recursos
  if (wsService) {
    wsService.disconnect()
  }
  
  cleanupEventListeners()
})
</script>

<style scoped lang="scss">
.websocket-test-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
  
  h2 {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 1.25rem;
    color: #333;
  }
}

.form-group {
  margin-bottom: 16px;
  
  label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
  }
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2196f3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
  }
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btn-primary {
  background-color: #2196f3;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #1976d2;
  }
}

.btn-secondary {
  background-color: #9e9e9e;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #757575;
  }
}

.btn-outline {
  background-color: transparent;
  border: 1px solid #9e9e9e;
  color: #333;
  
  &:hover:not(:disabled) {
    background-color: #f5f5f5;
  }
}

.status-container {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 10px;
}

.status-connected {
  background-color: #e8f5e9;
  
  .status-indicator {
    background-color: #4caf50;
  }
  
  .status-text {
    color: #2e7d32;
  }
}

.status-disconnected {
  background-color: #f5f5f5;
  
  .status-indicator {
    background-color: #9e9e9e;
  }
  
  .status-text {
    color: #616161;
  }
}

.status-error {
  background-color: #ffebee;
  
  .status-indicator {
    background-color: #f44336;
  }
  
  .status-text {
    color: #c62828;
  }
}

.socket-id {
  margin-bottom: 10px;
  
  code {
    background-color: #f5f5f5;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
  }
}

.error-message {
  color: #c62828;
  background-color: #ffebee;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.subscription-status {
  margin-top: 16px;
  padding: 10px;
  background-color: #e3f2fd;
  border-radius: 4px;
  
  code {
    background-color: #bbdefb;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
  }
}

.messages-container {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 16px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.message-item {
  padding: 12px;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
}

.message-header {
  display: flex;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.message-channel {
  font-weight: 600;
  margin-right: 8px;
}

.message-event {
  color: #2196f3;
  margin-right: 8px;
}

.message-time {
  color: #9e9e9e;
  margin-left: auto;
}

.message-data {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9rem;
  margin: 0;
  overflow-x: auto;
}
</style>
