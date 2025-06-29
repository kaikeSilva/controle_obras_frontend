<template>
  <div class="websocket-test-container">
    <h1>WebSocket Test</h1>
    
    <div class="panels-container">
      <div class="connection-panel">
        <ConnectionPanel 
          ref="connectionPanelRef"
          @connected="handleConnected"
          @disconnected="handleDisconnected"
          @error="handleError"
          @socket-id-changed="handleSocketIdChanged"
        />
      </div>
      
      <div class="channels-container">
        <div class="public-channel-panel">
          <PublicChannelPanel :wsService="wsService" />
        </div>
        
        <div class="private-channel-panel">
          <PrivateChannelPanel :wsService="wsService" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ConnectionPanel from './ConnectionPanel.vue'
import PublicChannelPanel from './PublicChannelPanel.vue'
import PrivateChannelPanel from './PrivateChannelPanel.vue'
import type { WebSocketService } from '@/services/websocket/WebSocketService'

// Referência para o componente de conexão
const connectionPanelRef = ref<InstanceType<typeof ConnectionPanel> | null>(null)

// Estado do serviço WebSocket
const wsService = ref<WebSocketService | null>(null)

// Manipuladores de eventos
const handleConnected = (service: WebSocketService) => {
  console.log('WebSocket conectado no componente principal')
  wsService.value = service
}

const handleDisconnected = () => {
  console.log('WebSocket desconectado no componente principal')
  wsService.value = null
}

const handleError = (error: Error) => {
  console.error('Erro WebSocket no componente principal:', error)
}

const handleSocketIdChanged = (socketId: string) => {
  console.log('Socket ID alterado:', socketId)
}
</script>

<style scoped lang="scss">
.websocket-test-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  
  h1 {
    margin-bottom: 20px;
    font-size: 1.8rem;
    color: #333;
  }
}

.panels-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.connection-panel {
  width: 100%;
}

.channels-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
}

.public-channel-panel,
.private-channel-panel {
  width: 100%;
}
</style>
