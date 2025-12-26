import { apiClient, extractApiError } from './config';
import type { EmployeeResponseDto, EmployeeRequestDto, EmployeesQueryParams, PagedResponse } from './types';

export const employeesService = {
  async getEmployees(params?: EmployeesQueryParams): Promise<PagedResponse<EmployeeResponseDto>> {
    try {
      const response = await apiClient.get<PagedResponse<EmployeeResponseDto>>('/employees', { params });
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },

  async getEmployeeById(id: number): Promise<EmployeeResponseDto> {
    try {
      const response = await apiClient.get<EmployeeResponseDto>(`/employees/${id}`);
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },

  async createEmployee(data: EmployeeRequestDto): Promise<EmployeeResponseDto> {
    try {
      const response = await apiClient.post<EmployeeResponseDto>('/employees', data);
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },

  async deleteEmployee(id: number): Promise<void> {
    try {
      await apiClient.delete(`/employees/${id}`);
    } catch (error) {
      throw extractApiError(error);
    }
  },

  async enableAccount(accountId: number): Promise<void> {
    try {
      await apiClient.patch(`/accounts/${accountId}/enable`);
    } catch (error) {
      throw extractApiError(error);
    }
  },

  async disableAccount(accountId: number): Promise<void> {
    try {
      await apiClient.patch(`/accounts/${accountId}/disable`);
    } catch (error) {
      throw extractApiError(error);
    }
  },
};

