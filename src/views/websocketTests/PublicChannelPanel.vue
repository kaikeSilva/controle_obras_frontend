<template>
  <div class="card">
    <h2>Canais Públicos</h2>
    
    <div class="form-group">
      <label for="public-channel">Canal:</label>
      <input 
        type="text" 
        id="public-channel" 
        v-model="channelName" 
        placeholder="channel-name"
        class="form-control"
        :disabled="!wsService"
      />
    </div>
    
    <div class="form-group">
      <label for="public-event">Evento:</label>
      <input 
        type="text" 
        id="public-event" 
        v-model="eventName" 
        placeholder="event-name"
        class="form-control"
        :disabled="!wsService"
      />
    </div>
    
    <div class="form-actions">
      <button 
        @click="subscribeToChannel" 
        :disabled="!channelName || !eventName || isSubscribing || !wsService"
        class="btn btn-primary"
      >
        Inscrever-se
      </button>
      
      <button 
        @click="unsubscribeFromChannel" 
        :disabled="!isSubscribed || isUnsubscribing || !wsService"
        class="btn btn-secondary"
      >
        Cancelar Inscrição
      </button>
    </div>
    
    <div v-if="isSubscribed" class="subscription-status">
      Inscrito em: <code>{{ channelName }}:{{ eventName }}</code>
    </div>

    <div v-if="messages.length > 0" class="messages-section">
      <h3>Mensagens Recebidas</h3>
      
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
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { WebSocketService } from '@/services/websocket/WebSocketService'
import type { WebSocketMessage } from '@/services/websocket/types'

// Props
const props = defineProps<{
  wsService: WebSocketService | null
}>()

// Estado do canal
const channelName = ref('')
const eventName = ref('')
const isSubscribed = ref(false)
const isSubscribing = ref(false)
const isUnsubscribing = ref(false)

// Mensagens recebidas
const messages = ref<WebSocketMessage[]>([])

// Watch para detectar mudanças no serviço WebSocket
watch(() => props.wsService, (newService) => {
  if (!newService) {
    // Se o serviço for desconectado, resetar o estado
    isSubscribed.value = false
  }
}, { immediate: true })

// Método para inscrever-se em um canal
const subscribeToChannel = () => {
  if (!props.wsService || !channelName.value || !eventName.value) return
  
  try {
    isSubscribing.value = true
    console.log('Subscrevendo canal público:', channelName.value, 'evento:', eventName.value)
    
    props.wsService.subscribe(
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
  if (!props.wsService || !channelName.value) return
  
  try {
    isUnsubscribing.value = true
    
    props.wsService.unsubscribe(channelName.value, eventName.value)
    
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

// Lifecycle hooks
onMounted(() => {
  // Nada a fazer no momento do mount
})

onUnmounted(() => {
  // Cancelar inscrição se estiver inscrito
  if (isSubscribed.value && props.wsService) {
    props.wsService.unsubscribe(channelName.value, eventName.value)
  }
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
    
    &:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
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
    
    &.btn-outline {
      background-color: transparent;
      border: 1px solid #ddd;
      color: #666;
      
      &:hover {
        background-color: #f5f5f5;
      }
    }
  }
}

.subscription-status {
  margin-top: 15px;
  padding: 10px;
  background-color: #e8f5e9;
  border-left: 4px solid #4caf50;
  color: #2e7d32;
  font-size: 14px;
  border-radius: 4px;
  
  code {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 2px 4px;
    border-radius: 3px;
    font-family: monospace;
  }
}

.messages-section {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.messages-container {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.message-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
  
  .message-header {
    display: flex;
    gap: 10px;
    margin-bottom: 5px;
    font-size: 12px;
    
    .message-channel {
      font-weight: bold;
      color: #4a90e2;
    }
    
    .message-event {
      color: #9c27b0;
    }
    
    .message-time {
      color: #9e9e9e;
      margin-left: auto;
    }
  }
  
  .message-data {
    margin: 0;
    padding: 8px;
    background-color: #f5f5f5;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    overflow-x: auto;
  }
}
</style>
