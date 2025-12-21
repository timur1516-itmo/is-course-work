import { apiClient } from './config';
import type {
  ProductCatalogResponseDto,
  CatalogQueryParams,
  PagedResponse,
} from './types';
import { getMockProducts, getMockProductById } from './mocks/catalog.mock';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || !import.meta.env.VITE_API_BASE_URL;

export const catalogService = {
  getProducts: async (params?: CatalogQueryParams): Promise<PagedResponse<ProductCatalogResponseDto>> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return getMockProducts({
        category: params?.category,
        name: params?.name,
        page: params?.page,
        size: params?.size,
      });
    }

    try {
      const response = await apiClient.get<PagedResponse<ProductCatalogResponseDto>>('/catalog', { params });
      return response.data;
    } catch (error) {
      console.warn('API error, using mock data:', error);
      return getMockProducts({
        category: params?.category,
        name: params?.name,
        page: params?.page,
        size: params?.size,
      });
    }
  },

  getProductById: async (id: number): Promise<ProductCatalogResponseDto> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const product = getMockProductById(id);
      if (!product) {
        throw new Error('Product not found');
      }
      return product;
    }

    try {
      const response = await apiClient.get<ProductCatalogResponseDto>(`/catalog/${id}`);
      return response.data;
    } catch (error) {
      console.warn('API error, using mock data:', error);
      const product = getMockProductById(id);
      if (!product) {
        throw error;
      }
      return product;
    }
  },
};

