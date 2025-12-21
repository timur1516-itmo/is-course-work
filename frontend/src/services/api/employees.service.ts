import { apiClient, extractApiError } from './config';
import type { EmployeeResponseDto } from './types';
import { getMockEmployeeById } from './mocks/orders.mock';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || !import.meta.env.VITE_API_BASE_URL;

export const employeesService = {
  async getEmployeeById(id: number): Promise<EmployeeResponseDto> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const employee = getMockEmployeeById(id);
      if (!employee) {
        throw new Error('Employee not found');
      }
      return employee;
    }

    try {
      const response = await apiClient.get<EmployeeResponseDto>(`/employees/${id}`);
      return response.data;
    } catch (error) {
      console.warn('API error, using mock data:', error);
      const employee = getMockEmployeeById(id);
      if (!employee) {
        throw extractApiError(error);
      }
      return employee;
    }
  },
};

