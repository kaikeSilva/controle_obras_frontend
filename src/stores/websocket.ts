import { defineStore } from 'pinia';
import { reactive, readonly, computed } from 'vue';
import type { WebSocketService } from '@/services/websocket/WebSocketService';
import { WEBSOCKET_EVENTS } from '@/services/websocket/config';
import type { WebSocketState, WebSocketMessage, ConnectionStatus } from '@/services/websocket/types';
import { eventBus } from '@/utils/events';
import { logger } from '@/utils/logger';

export const useWebSocketStore = defineStore('websocket', () => {
  let serviceInstance: WebSocketService | null = null;

  const state = reactive<WebSocketState>({
    status: 'disconnected',
    isConnected: false,
    socketId: null,
    lastError: null,
    reconnectAttempts: 0,
    messages: [],
  });

  const initializeService = (service: WebSocketService) => {
    serviceInstance = service;
    Object.assign(state, serviceInstance.state);
  };

  const connect = async () => {
    if (!serviceInstance) {
      logger.error('Pinia Store: Service not initialized before connect.');
      return;
    }
    await serviceInstance.connect();
  };

  const disconnect = () => {
    if (!serviceInstance) return;
    serviceInstance.disconnect();
  };

  const subscribe = (channel: string, event: string, callback: (data: any) => void) => {
    if (!serviceInstance) return;
    serviceInstance.subscribe(channel, event, callback);
  };

  const unsubscribe = (channel: string, event?: string) => {
    if (!serviceInstance) return;
    serviceInstance.unsubscribe(channel, event);
  };

  const sendMessage = (channel: string, event: string, data: any) => {
    if (!serviceInstance) return;
    serviceInstance.send(channel, event, data);
  };
  
  eventBus.on(WEBSOCKET_EVENTS.CONNECTED, ({ socketId }) => {
    if (serviceInstance) Object.assign(state, serviceInstance.state);
  });

  eventBus.on(WEBSOCKET_EVENTS.DISCONNECTED, () => {
    if (serviceInstance) Object.assign(state, serviceInstance.state);
  });

  eventBus.on(WEBSOCKET_EVENTS.ERROR, (error) => {
    if (serviceInstance) Object.assign(state, serviceInstance.state);
  });

  eventBus.on(WEBSOCKET_EVENTS.MESSAGE_RECEIVED, (message: WebSocketMessage) => {
    if (serviceInstance) Object.assign(state, serviceInstance.state);
  });

  eventBus.on(WEBSOCKET_EVENTS.RECONNECTING, ({ attempt }) => {
    if (serviceInstance) Object.assign(state, serviceInstance.state);
  });

  eventBus.on(WEBSOCKET_EVENTS.RECONNECT_FAILED, () => {
    if (serviceInstance) Object.assign(state, serviceInstance.state);
  });

  const lastMessage = computed(() => {
    if (serviceInstance && serviceInstance.state.messages.length > 0) {
      return serviceInstance.state.messages[serviceInstance.state.messages.length - 1];
    }
    return null;
  });

  const exposedState = computed(() => serviceInstance ? serviceInstance.state : state);

  return {
    state: readonly(exposedState.value),
    initializeService,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    sendMessage,
    getSocketId: () => serviceInstance?.getSocketId() ?? null,
    status: computed(() => serviceInstance?.state.status ?? state.status),
    isConnected: computed(() => serviceInstance?.state.isConnected ?? state.isConnected),
    socketId: computed(() => serviceInstance?.state.socketId ?? state.socketId),
    lastError: computed(() => serviceInstance?.state.lastError ?? state.lastError),
    messages: computed(() => serviceInstance?.state.messages ?? state.messages),
    lastMessage,
  };
});
