import { apiClient } from './config';
import type { ProductDesignResponseDto } from './types';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || !import.meta.env.VITE_API_BASE_URL;

const mockDesigns: Record<number, ProductDesignResponseDto> = {
  101: {
    id: 101,
    productName: "Кухонный стол из дуба",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    files: [],
    requiredMaterials: [
      { materialId: 1, amount: 0.5 },
    ],
  },
  102: {
    id: 102,
    productName: "Логотип компании из нержавеющей стали",
    createdAt: "2024-01-16T10:00:00Z",
    updatedAt: "2024-01-16T10:00:00Z",
    files: [],
    requiredMaterials: [
      { materialId: 2, amount: 0.1 },
    ],
  },
  103: {
    id: 103,
    productName: "Декоративные панели для стен",
    createdAt: "2024-01-17T10:00:00Z",
    updatedAt: "2024-01-17T10:00:00Z",
    files: [],
    requiredMaterials: [
      { materialId: 3, amount: 1.5 },
    ],
  },
};

export const designsService = {
  getDesignById: async (id: number): Promise<ProductDesignResponseDto> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const design = mockDesigns[id];
      if (!design) {
        throw new Error('Design not found');
      }
      return design;
    }

    try {
      const response = await apiClient.get<ProductDesignResponseDto>(`/designs/${id}`);
      return response.data;
    } catch (error) {
      console.warn('API error, using mock data:', error);
      const design = mockDesigns[id];
      if (!design) {
        throw error;
      }
      return design;
    }
  },
};

