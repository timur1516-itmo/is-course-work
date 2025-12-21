import { apiClient } from './config';
import type { MaterialResponseDto } from './types';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || !import.meta.env.VITE_API_BASE_URL;

const mockMaterials: Record<number, MaterialResponseDto> = {
  1: {
    id: 1,
    name: "Дуб",
    unitOfMeasure: "м³",
    orderPoint: 10.0,
    currentBalance: 15.5,
  },
  2: {
    id: 2,
    name: "Нержавеющая сталь",
    unitOfMeasure: "кг",
    orderPoint: 50.0,
    currentBalance: 75.0,
  },
  3: {
    id: 3,
    name: "МДФ",
    unitOfMeasure: "м²",
    orderPoint: 20.0,
    currentBalance: 30.0,
  },
  4: {
    id: 4,
    name: "Акрил",
    unitOfMeasure: "м²",
    orderPoint: 15.0,
    currentBalance: 25.0,
  },
  5: {
    id: 5,
    name: "Бамбук",
    unitOfMeasure: "м²",
    orderPoint: 5.0,
    currentBalance: 8.0,
  },
  6: {
    id: 6,
    name: "Фанера",
    unitOfMeasure: "м²",
    orderPoint: 30.0,
    currentBalance: 45.0,
  },
  7: {
    id: 7,
    name: "Композитный алюминий",
    unitOfMeasure: "м²",
    orderPoint: 10.0,
    currentBalance: 12.0,
  },
  8: {
    id: 8,
    name: "Пластик",
    unitOfMeasure: "м²",
    orderPoint: 20.0,
    currentBalance: 35.0,
  },
};

export const materialsService = {
  getMaterialById: async (id: number): Promise<MaterialResponseDto> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const material = mockMaterials[id];
      if (!material) {
        throw new Error('Material not found');
      }
      return material;
    }

    try {
      const response = await apiClient.get<MaterialResponseDto>(`/materials/${id}`);
      return response.data;
    } catch (error) {
      console.warn('API error, using mock data:', error);
      const material = mockMaterials[id];
      if (!material) {
        throw error;
      }
      return material;
    }
  },
};

