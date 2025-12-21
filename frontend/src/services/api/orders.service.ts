import { apiClient, extractApiError } from './config';
import type { ClientOrderResponseDto } from './types';
import { getMockOrderById } from './mocks/orders.mock';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || !import.meta.env.VITE_API_BASE_URL;

export const ordersService = {
  async getOrderById(id: number): Promise<ClientOrderResponseDto> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const order = getMockOrderById(id);
      if (!order) {
        throw new Error('Order not found');
      }
      return order;
    }

    try {
      const response = await apiClient.get<ClientOrderResponseDto>(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.warn('API error, using mock data:', error);
      const order = getMockOrderById(id);
      if (!order) {
        throw extractApiError(error);
      }
      return order;
    }
  },
};

