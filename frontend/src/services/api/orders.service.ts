import { apiClient, extractApiError } from './config';
import type { ClientOrderResponseDto, CreateOrderRequestDto } from './types';

export const ordersService = {
  createOrder: async (data: CreateOrderRequestDto): Promise<ClientOrderResponseDto> => {
    try {
      const response = await apiClient.post<ClientOrderResponseDto>('/orders', data);
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },

  getOrderById: async (id: number): Promise<ClientOrderResponseDto> => {
    try {
      const response = await apiClient.get<ClientOrderResponseDto>(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },

  getOrders: async (params?: {
    status?: string;
    clientId?: number;
    managerId?: number;
    createdFrom?: string;
    createdTo?: string;
    page?: number;
    size?: number;
    sort?: string[];
  }): Promise<ClientOrderResponseDto[]> => {
    try {
      const response = await apiClient.get<{ content: ClientOrderResponseDto[] } | ClientOrderResponseDto[]>('/orders', { params });
      const data = response.data;
      if (data && typeof data === 'object' && 'content' in data && Array.isArray(data.content)) {
        return data.content;
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      throw extractApiError(error);
    }
  },

  changeOrderStatus: async (
    orderId: number,
    status: string,
    comment?: string
  ): Promise<void> => {
    try {
      await apiClient.post(`/orders/${orderId}/status`, {
        status,
        comment,
      });
    } catch (error) {
      throw extractApiError(error);
    }
  },

  updateOrderPrice: async (
    orderId: number,
    price: number
  ): Promise<void> => {
    try {
      await apiClient.patch(`/orders/${orderId}/price`, {
        price,
      });
    } catch (error) {
      throw extractApiError(error);
    }
  },
};

