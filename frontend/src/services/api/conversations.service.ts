import { apiClient, extractApiError } from './config';
import type {
  ConversationResponseDto,
  MessageResponseDto,
  SendMessageRequestDto,
  MessagesQueryParams,
} from './types';

export const conversationsService = {
  async getConversationByOrderId(orderId: number): Promise<ConversationResponseDto> {
    try {
      const response = await apiClient.get<ConversationResponseDto>(
        `/orders/${orderId}/conversation`
      );
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },

  async getMessages(
    conversationId: number,
    params?: MessagesQueryParams
  ): Promise<MessageResponseDto[]> {
    try {
      // Бэкенд может возвращать Page<MessageResponseDto>, извлекаем content
      const response = await apiClient.get<{ content: MessageResponseDto[] } | MessageResponseDto[]>(
        `/conversations/${conversationId}/messages`,
        { params }
      );
      const data = response.data;
      // Проверяем, является ли ответ пагинированным
      if (data && typeof data === 'object' && 'content' in data && Array.isArray(data.content)) {
        return data.content;
      }
      // Или это простой массив
      return Array.isArray(data) ? data : [];
    } catch (error) {
      throw extractApiError(error);
    }
  },

  async sendMessage(
    conversationId: number,
    data: SendMessageRequestDto
  ): Promise<MessageResponseDto> {
    try {
      const response = await apiClient.post<MessageResponseDto>(
        `/conversations/${conversationId}/messages`,
        data
      );
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },
};

const WS_BASE_URL = '/ws'

export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private conversationId: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();

  connect(conversationId: number, token?: string) {
    if (this.ws?.readyState === WebSocket.OPEN && this.conversationId === conversationId) {
      return;
    }

    this.disconnect();
    this.conversationId = conversationId;

    const url = `${WS_BASE_URL}/conversations/${conversationId}${token ? `?token=${token}` : ''}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.emit('open', { conversationId });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit('message', data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', { error });
    };

    this.ws.onclose = () => {
      this.emit('close', { conversationId });
      this.attemptReconnect();
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts || !this.conversationId) {
      return;
    }

    this.reconnectAttempts++;
    setTimeout(() => {
      if (this.conversationId) {
        const token = localStorage.getItem('accessToken') || undefined;
        this.connect(this.conversationId, token);
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.conversationId = null;
    this.reconnectAttempts = 0;
  }

  on(event: string, callback: (data: unknown) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: unknown) => void) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: unknown) {
    this.listeners.get(event)?.forEach((callback) => callback(data));
  }

  send(data: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const chatWebSocket = new ChatWebSocket();

