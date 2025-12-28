import { apiClient, extractApiError } from './config';
import type { ProductDesignResponseDto, ProductDesignRequestDto, RequiredMaterialDto } from './types';

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

  addFileToDesign: async (designId: number, fileId: number): Promise<ProductDesignResponseDto> => {
    try {
      const response = await apiClient.post<ProductDesignResponseDto>(
        `/designs/${designId}/files`,
        { fileId }
      );
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },

  addMaterialToDesign: async (designId: number, material: RequiredMaterialDto): Promise<ProductDesignResponseDto> => {
    try {
      const response = await apiClient.post<ProductDesignResponseDto>(
        `/designs/${designId}/materials`,
        material
      );
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },

  assignDesigner: async (designId: number): Promise<ProductDesignResponseDto> => {
    try {
      const response = await apiClient.post<ProductDesignResponseDto>(
        `/designs/${designId}/assign`
      );
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },

  removeFileFromDesign: async (designId: number, fileId: number): Promise<ProductDesignResponseDto> => {
    try {
      const response = await apiClient.delete<ProductDesignResponseDto>(
        `/designs/${designId}/files/${fileId}`
      );
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },
};

