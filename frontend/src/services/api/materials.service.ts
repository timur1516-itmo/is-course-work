import { apiClient, extractApiError } from './config';
import type { MaterialResponseDto } from './types';

export const materialsService = {
  getMaterialById: async (id: number): Promise<MaterialResponseDto> => {
    try {
      const response = await apiClient.get<MaterialResponseDto>(`/materials/${id}`);
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },
};

