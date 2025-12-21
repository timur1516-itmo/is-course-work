import { apiClient, extractApiError } from './config';
import type { ProductDesignResponseDto, ProductDesignRequestDto } from './types';

export const designsService = {
  getDesignById: async (id: number): Promise<ProductDesignResponseDto> => {
    try {
      const response = await apiClient.get<ProductDesignResponseDto>(`/designs/${id}`);
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },

  createDesign: async (data: ProductDesignRequestDto): Promise<ProductDesignResponseDto> => {
    try {
      const response = await apiClient.post<ProductDesignResponseDto>('/designs', data);
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },

  updateDesign: async (id: number, data: ProductDesignRequestDto): Promise<ProductDesignResponseDto> => {
    try {
      const response = await apiClient.put<ProductDesignResponseDto>(`/designs/${id}`, data);
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },
};

