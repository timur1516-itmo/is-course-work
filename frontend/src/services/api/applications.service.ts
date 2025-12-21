import { apiClient } from './config';
import type {
  ClientApplicationRequestDto,
  ClientApplicationResponseDto,
  FileMetadataResponseDto,
} from './types';
import { getMockApplicationAttachments } from './mocks/orders.mock';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || !import.meta.env.VITE_API_BASE_URL;

export const applicationsService = {
  createApplication: async (data: ClientApplicationRequestDto): Promise<ClientApplicationResponseDto> => {
    const response = await apiClient.post<ClientApplicationResponseDto>('/client-applications', data);
    return response.data;
  },

  async getApplicationAttachments(applicationId: number): Promise<FileMetadataResponseDto[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return getMockApplicationAttachments(applicationId);
    }

    try {
      const response = await apiClient.get<FileMetadataResponseDto[]>(
        `/client-applications/${applicationId}/attachments`
      );
      return response.data;
    } catch (error) {
      console.warn('API error, using mock data:', error);
      return getMockApplicationAttachments(applicationId);
    }
  },
};

