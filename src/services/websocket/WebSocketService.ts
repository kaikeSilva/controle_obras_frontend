import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { reactive } from 'vue';
import type { WebSocketConfig, WebSocketState, WebSocketMessage } from './types';
import { WEBSOCKET_EVENTS } from './config';
import type { Logger } from '@/utils/logger';
import type { EventBus } from '@/utils/events';

// Tornar Pusher disponível globalmente
(window as any).Pusher = Pusher;

export class WebSocketService {
  private echo: Echo<any> | null = null;
  private config: WebSocketConfig;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private logger: Logger;
  private eventBus: EventBus;
  
  public state = reactive<WebSocketState>({
    status: 'disconnected',
    isConnected: false,
    socketId: null,
    lastError: null,
    reconnectAttempts: 0,
    messages: [],
  });

  constructor(config: WebSocketConfig, eventBus: EventBus, logger: Logger) {
    this.config = config;
    this.eventBus = eventBus;
    this.logger = logger;
    this.setupGlobalErrorHandling();
  }

  async connect(): Promise<void> {
    try {
      this.updateStatus('connecting');

      if (this.echo) {
        this.disconnect();
      }

      this.echo = new Echo(this.config as any); // Cast to any due to Echo types
      console.log('Echo:', this.echo);
      // console das configurações
      console.log('Config:', this.config);  
      await this.setupConnectionHandlers();
      
    } catch (error) {
      this.logger.error('Erro ao conectar WebSocket:', error);
      this.handleConnectionError(error as Error);
    }
  }

  disconnect(): void {
    if (this.echo) {
      this.echo.disconnect();
      this.echo = null;
    }
    
    this.clearReconnectTimer();
    this.updateStatus('disconnected');
    this.eventBus.emit(WEBSOCKET_EVENTS.DISCONNECTED);
  }

  /**
   * Inscreve-se em um canal público
   */
  subscribe(channel: string, event: string, callback: (data: any) => void): void {
    if (!this.echo) {
      throw new Error('WebSocket não conectado');
    }
    const eventName = event.startsWith('.') ? event : `.${event}`;
    console.log('Subscrevendo canal público:', channel, 'evento:', eventName);
    this.echo.channel(channel).listen(eventName, (data: any) => {
      console.log('Mensagem recebida:', data);
      const message: WebSocketMessage = {
        id: crypto.randomUUID(),
        channel,
        event,
        data,
        timestamp: new Date(),
      };
      console.log('Mensagem recebida:', message);
      this.state.messages.push(message);
      this.eventBus.emit(WEBSOCKET_EVENTS.MESSAGE_RECEIVED, message);
      callback(data);
    });
  }
  
  /**
   * Inscreve-se em um canal privado
   * 
   * Canais privados requerem autenticação via endpoint /broadcasting/auth
   * O nome do canal deve começar com 'private-'
   */
  subscribePrivate(channel: string, event: string, callback: (data: any) => void): void {
    if (!this.echo) {
      throw new Error('WebSocket não conectado');
    }
    
    // Remover private pois o metodo do echo ja adiciona
    const privateChannel = channel;
    const eventName = event.startsWith('.') ? event : `.${event}`;
    
    console.log('Subscrevendo canal privado:', privateChannel, 'evento:', eventName);
    
    try {
      this.echo.private(privateChannel).listen(eventName, (data: any) => {
        console.log('Mensagem privada recebida:', data);
        const message: WebSocketMessage = {
          id: crypto.randomUUID(),
          channel: privateChannel,
          event,
          data,
          timestamp: new Date(),
        };
        this.state.messages.push(message);
        this.eventBus.emit(WEBSOCKET_EVENTS.MESSAGE_RECEIVED, message);
        callback(data);
      });
    } catch (error) {
      console.error('Erro ao inscrever-se em canal privado:', error);
      this.handleConnectionError(error as Error);
      throw error;
    }
  }

  /**
   * Cancela a inscrição em um canal (público ou privado)
   */
  unsubscribe(channel: string, event?: string): void {
    if (!this.echo) {
      return;
    }
    if (event) {
      this.echo.channel(channel).stopListening(event);
    } else {
      this.echo.leaveChannel(channel);
    }
  }
  
  /**
   * Cancela a inscrição em um canal privado
   */
  unsubscribePrivate(channel: string, event?: string): void {
    if (!this.echo) {
      return;
    }
    
    // Remover private pois o metodo do echo ja adiciona
    const privateChannel = channel;
    
    if (event) {
      this.echo.private(privateChannel).stopListening(event);
    } else {
      this.echo.leaveChannel(privateChannel);
    }
  }

  send(channel: string, event: string, data: any): void {
    if (!this.echo || !this.state.isConnected) {
      throw new Error('WebSocket não conectado para enviar mensagem.');
    }
    // Laravel Echo's client events are typically prefixed with 'client-'
    // This example assumes you might be using whisper or a similar client event mechanism
    // Pusher client events need to be enabled on the server side
    // For standard Pusher, you might need a different approach or use HTTP for sending if not using client events.
    this.echo.private(channel).whisper(event, data); 
  }

  private async setupConnectionHandlers(): Promise<void> {
    if (!this.echo) return;

    this.echo.connector.pusher.connection.bind('connected', () => {
      this.updateStatus('connected');
      this.state.socketId = this.echo?.socketId() || null;
      this.state.reconnectAttempts = 0;
      this.clearReconnectTimer();
      this.eventBus.emit(WEBSOCKET_EVENTS.CONNECTED, { socketId: this.state.socketId });
    });

    this.echo.connector.pusher.connection.bind('connecting', () => {
      this.updateStatus('connecting');
      this.eventBus.emit(WEBSOCKET_EVENTS.CONNECTING);
    });

    this.echo.connector.pusher.connection.bind('disconnected', () => {
      this.logger.warn('WebSocket desconectado.');
      this.updateStatus('disconnected');
      this.eventBus.emit(WEBSOCKET_EVENTS.DISCONNECTED);
      if (this.config.reconnectAttempts && this.config.reconnectInterval) {
        this.scheduleReconnect();
      }
    });

    this.echo.connector.pusher.connection.bind('error', (err: any) => {
      this.logger.error('Erro na conexão WebSocket:', err);
      this.handleConnectionError(err as Error);
      this.eventBus.emit(WEBSOCKET_EVENTS.ERROR, err);
    });
  }

  private handleConnectionError(error: Error): void {
    this.state.lastError = error.message;
    this.updateStatus('failed');
    if (this.config.reconnectAttempts && this.config.reconnectInterval) {
        this.scheduleReconnect();
    }
  }

  private updateStatus(status: WebSocketState['status']): void {
    this.state.status = status;
    this.state.isConnected = status === 'connected';
    if (status === 'disconnected' || status === 'failed') {
        this.state.socketId = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.state.reconnectAttempts >= (this.config.reconnectAttempts || 5)) {
      this.logger.error('Máximo de tentativas de reconexão atingido');
      this.updateStatus('failed');
      this.eventBus.emit(WEBSOCKET_EVENTS.RECONNECT_FAILED);
      return;
    }

    this.clearReconnectTimer();
    this.updateStatus('reconnecting');
    this.state.reconnectAttempts++;
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.config.reconnectInterval);
    this.eventBus.emit(WEBSOCKET_EVENTS.RECONNECTING, { attempt: this.state.reconnectAttempts });
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private setupGlobalErrorHandling(): void {
    // Exemplo: Capturar erros não tratados que podem indicar problemas de conexão
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        if (event.reason && typeof event.reason.message === 'string') {
          if (event.reason.message.includes('Pusher: Connection timed out')) {
            this.logger.error('Erro global: Timeout de conexão Pusher detectado.', event.reason);
            this.handleConnectionError(new Error('Pusher connection timed out'));
          }
        }
      });
    }
  }

  public getSocketId(): string | null {
    return this.state.socketId;
  }
}
