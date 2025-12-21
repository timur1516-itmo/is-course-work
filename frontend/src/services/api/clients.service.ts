import { apiClient, extractApiError } from './config';
import type { ClientResponseDto } from './types';
import { getMockClientById } from './mocks/orders.mock';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || !import.meta.env.VITE_API_BASE_URL;

export const clientsService = {
  async getClientById(id: number): Promise<ClientResponseDto> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const client = getMockClientById(id);
      if (!client) {
        throw new Error('Client not found');
      }
      return client;
    }

    try {
      const response = await apiClient.get<ClientResponseDto>(`/clients/${id}`);
      return response.data;
    } catch (error) {
      console.warn('API error, using mock data:', error);
      const client = getMockClientById(id);
      if (!client) {
        throw extractApiError(error);
      }
      return client;
    }
  },
};

