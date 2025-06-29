<template>
  <div class="card">
    <h2>Canais Privados</h2>
    
    <div class="form-group">
      <label for="private-channel">Canal Privado:</label>
      <div class="input-group">
        <div class="input-prefix">private-</div>
        <input 
          type="text" 
          id="private-channel" 
          v-model="channelNameWithoutPrefix" 
          placeholder="nome-do-canal"
          class="form-control with-prefix"
          :disabled="!wsService"
        />
      </div>
      <small class="form-hint">O prefixo "private-" será adicionado automaticamente</small>
    </div>
    
    <div class="form-group">
      <label for="private-event">Evento:</label>
      <input 
        type="text" 
        id="private-event" 
        v-model="eventName" 
        placeholder="event-name"
        class="form-control"
        :disabled="!wsService"
      />
    </div>
    
    <div class="form-actions">
      <button 
        @click="subscribeToPrivateChannel" 
        :disabled="!channelNameWithoutPrefix || !eventName || isSubscribing || !wsService"
        class="btn btn-primary"
      >
        Inscrever-se
      </button>
      
      <button 
        @click="unsubscribeFromPrivateChannel" 
        :disabled="!isSubscribed || isUnsubscribing || !wsService"
        class="btn btn-secondary"
      >
        Cancelar Inscrição
      </button>
    </div>
    
    <div v-if="isSubscribed" class="subscription-status">
      Inscrito em canal privado: <code>private-{{ channelNameWithoutPrefix }}:{{ eventName }}</code>
    </div>

    <div v-if="authError" class="auth-error">
      <h3>Erro de Autenticação</h3>
      <p>{{ authError }}</p>
      <p class="auth-error-hint">
        Certifique-se de que:
        <ul>
          <li>O token de autenticação é válido</li>
          <li>O endpoint /broadcasting/auth está configurado corretamente</li>
          <li>O servidor está rodando e acessível</li>
        </ul>
      </p>
    </div>

    <div v-if="messages.length > 0" class="messages-section">
      <h3>Mensagens Privadas Recebidas</h3>
      
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { WebSocketService } from '@/services/websocket/WebSocketService'
import type { WebSocketMessage } from '@/services/websocket/types'
// authentication service
import { useAuthStore } from '@/stores/auth'

// get logged user id
const authStore = useAuthStore()

// Props
const props = defineProps<{
  wsService: WebSocketService | null
}>()

// Estado do canal
const channelNameWithoutPrefix = ref('')
const eventName = ref('')
const isSubscribed = ref(false)
const isSubscribing = ref(false)
const isUnsubscribing = ref(false)
const authError = ref<string | null>(null)

// Mensagens recebidas
const messages = ref<WebSocketMessage[]>([])

// Computed para o nome completo do canal
const fullChannelName = computed(() => {
  return `${channelNameWithoutPrefix.value}`
})

// Watch para detectar mudanças no serviço WebSocket
watch(() => props.wsService, (newService) => {
  if (!newService) {
    // Se o serviço for desconectado, resetar o estado
    isSubscribed.value = false
    authError.value = null
  }
}, { immediate: true })

// Método para inscrever-se em um canal privado
const subscribeToPrivateChannel = () => {
  if (!props.wsService || !channelNameWithoutPrefix.value || !eventName.value) return
  // private channel format : notification-channel.{$this->userId}
  try {
    isSubscribing.value = true
    authError.value = null
    console.log('Subscrevendo canal privado:', channelNameWithoutPrefix.value + '.' + authStore.user?.id, 'evento:', eventName.value)
    
    props.wsService.subscribePrivate(
      channelNameWithoutPrefix.value + '.' + authStore.user?.id,
      eventName.value, 
      (data) => {
        console.log(`Callback direto: Mensagem privada recebida em ${fullChannelName.value}:${eventName.value}`, data)
        
        // Adicionar a mensagem à lista de mensagens exibidas
        messages.value.unshift({
          id: crypto.randomUUID(),
          channel: fullChannelName.value,
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
    console.error('Erro ao inscrever-se em canal privado:', error)
    authError.value = error instanceof Error ? error.message : 'Erro desconhecido ao inscrever-se no canal privado'
  } finally {
    isSubscribing.value = false
  }
}

// Método para cancelar inscrição em um canal privado
const unsubscribeFromPrivateChannel = () => {
  if (!props.wsService || !channelNameWithoutPrefix.value) return
  
  try {
    isUnsubscribing.value = true
    
    props.wsService.unsubscribePrivate(channelNameWithoutPrefix.value, eventName.value)
    
    isSubscribed.value = false
    authError.value = null
    
  } catch (error) {
    console.error('Erro ao cancelar inscrição em canal privado:', error)
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
    props.wsService.unsubscribePrivate(channelNameWithoutPrefix.value, eventName.value)
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
  
  .input-group {
    display: flex;
    align-items: center;
    
    .input-prefix {
      background-color: #f5f5f5;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-right: none;
      border-radius: 4px 0 0 4px;
      color: #666;
      font-family: monospace;
    }
    
    .form-control.with-prefix {
      border-radius: 0 4px 4px 0;
    }
  }
  
  .form-hint {
    display: block;
    margin-top: 5px;
    color: #666;
    font-size: 12px;
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

.auth-error {
  margin-top: 15px;
  padding: 15px;
  background-color: #ffebee;
  border-left: 4px solid #f44336;
  color: #b71c1c;
  font-size: 14px;
  border-radius: 4px;
  
  h3 {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 16px;
    color: #b71c1c;
  }
  
  .auth-error-hint {
    margin-top: 10px;
    font-size: 13px;
    
    ul {
      margin-top: 5px;
      padding-left: 20px;
    }
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
      color: #9c27b0; // Cor diferente para canais privados
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
