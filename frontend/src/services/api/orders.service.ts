import { apiClient, extractApiError } from './config';
import type { ClientOrderResponseDto } from './types';

export const ordersService = {
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
      const response = await apiClient.get<ClientOrderResponseDto[]>('/orders', { params });
      return response.data;
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
};

