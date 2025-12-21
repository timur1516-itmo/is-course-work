import { apiClient, extractApiError } from './config';
import type { ClientResponseDto } from './types';

export const clientsService = {
  async getClientById(id: number): Promise<ClientResponseDto> {
    try {
      const response = await apiClient.get<ClientResponseDto>(`/clients/${id}`);
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },
};

