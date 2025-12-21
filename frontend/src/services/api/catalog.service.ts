import { apiClient, extractApiError } from './config';
import type {
  ProductCatalogResponseDto,
  CatalogQueryParams,
  PagedResponse,
} from './types';

export const catalogService = {
  getProducts: async (params?: CatalogQueryParams): Promise<PagedResponse<ProductCatalogResponseDto>> => {
    try {
      const response = await apiClient.get<PagedResponse<ProductCatalogResponseDto>>('/catalog', { params });
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },

  getProductById: async (id: number): Promise<ProductCatalogResponseDto> => {
    try {
      const response = await apiClient.get<ProductCatalogResponseDto>(`/catalog/${id}`);
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },
};

