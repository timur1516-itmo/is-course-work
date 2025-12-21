import { apiClient, extractApiError } from './config';
import type {
  ConversationResponseDto,
  MessageResponseDto,
  SendMessageRequestDto,
  MessagesQueryParams,
} from './types';
import {
  getMockConversationByOrderId,
  getMockMessages,
  addMockMessage,
} from './mocks/orders.mock';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || !import.meta.env.VITE_API_BASE_URL;

export const conversationsService = {
  async getConversationByOrderId(orderId: number): Promise<ConversationResponseDto> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const conversation = getMockConversationByOrderId(orderId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      return conversation;
    }

    try {
      const response = await apiClient.get<ConversationResponseDto>(
        `/orders/${orderId}/conversation`
      );
      return response.data;
    } catch (error) {
      console.warn('API error, using mock data:', error);
      const conversation = getMockConversationByOrderId(orderId);
      if (!conversation) {
        throw extractApiError(error);
      }
      return conversation;
    }
  },

  async getMessages(
    conversationId: number,
    params?: MessagesQueryParams
  ): Promise<MessageResponseDto[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      let messages = getMockMessages(conversationId);

      if (params?.authorId) {
        messages = messages.filter((msg) => msg.authorId === params.authorId);
      }
      if (params?.content) {
        const searchContent = params.content.toLowerCase();
        messages = messages.filter((msg) =>
          msg.content.toLowerCase().includes(searchContent)
        );
      }
      if (params?.sentFrom) {
        const sentFrom = new Date(params.sentFrom);
        messages = messages.filter((msg) => new Date(msg.sentAt) >= sentFrom);
      }
      if (params?.sentTo) {
        const sentTo = new Date(params.sentTo);
        messages = messages.filter((msg) => new Date(msg.sentAt) <= sentTo);
      }

      const sortParam = params?.sort?.[0] || 'sentAt,ASC';
      const [field, direction] = sortParam.split(',');
      messages.sort((a, b) => {
        const aValue = field === 'id' ? a.id : field === 'sentAt' ? a.sentAt : field === 'authorId' ? a.authorId : field === 'content' ? a.content : '';
        const bValue = field === 'id' ? b.id : field === 'sentAt' ? b.sentAt : field === 'authorId' ? b.authorId : field === 'content' ? b.content : '';
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return direction === 'DESC' ? -comparison : comparison;
      });

      return messages;
    }

    try {
      const response = await apiClient.get<MessageResponseDto[]>(
        `/conversations/${conversationId}/messages`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.warn('API error, using mock data:', error);
      return getMockMessages(conversationId);
    }
  },

  async sendMessage(
    conversationId: number,
    data: SendMessageRequestDto
  ): Promise<MessageResponseDto> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const authorId = 123;
      return addMockMessage(conversationId, authorId, data.content);
    }

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

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080/ws';

export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private conversationId: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

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

