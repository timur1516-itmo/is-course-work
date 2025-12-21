import { apiClient, extractApiError } from './config';

export type ProductionTaskStatus = 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED';

export interface ProductionTaskResponseDto {
  id: number;
  clientOrderId: number;
  status: ProductionTaskStatus;
  cncOperatorId?: number;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
}

export const productionService = {
  async getProductionTasks(params?: {
    clientOrderId?: number;
    currentStatusId?: number;
    cncOperatorId?: number;
    startedFrom?: string;
    startedTo?: string;
    finishedFrom?: string;
    finishedTo?: string;
    createdFrom?: string;
    createdTo?: string;
    page?: number;
    size?: number;
    sort?: string[];
  }): Promise<ProductionTaskResponseDto[]> {
    try {
      const response = await apiClient.get<ProductionTaskResponseDto[]>('/production-tasks', { params });
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },

  async getProductionTaskById(id: number): Promise<ProductionTaskResponseDto> {
    try {
      const response = await apiClient.get<ProductionTaskResponseDto>(`/production-tasks/${id}`);
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },

  async startTask(id: number): Promise<void> {
    try {
      await apiClient.post(`/production-tasks/${id}/start`);
    } catch (error) {
      throw extractApiError(error);
    }
  },

  async finishTask(id: number): Promise<void> {
    try {
      await apiClient.post(`/production-tasks/${id}/finish`);
    } catch (error) {
      throw extractApiError(error);
    }
  },
};

