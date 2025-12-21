import { apiClient, extractApiError } from './config';
import type { EmployeeResponseDto } from './types';

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  employee?: EmployeeResponseDto;
}

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || !import.meta.env.VITE_API_BASE_URL;

export const authService = {
  async login(data: LoginRequestDto): Promise<LoginResponseDto> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockUsers: Record<string, { password: string; employeeId: number }> = {
        'petrov': { password: 'password123', employeeId: 101 },
        'smirnova': { password: 'password123', employeeId: 102 },
        'admin': { password: 'admin123', employeeId: 101 },
      };

      const user = mockUsers[data.username];
      if (!user || user.password !== data.password) {
        throw new Error('Invalid username or password');
      }

      const mockToken = `mock_token_${data.username}_${Date.now()}`;
      localStorage.setItem('accessToken', mockToken);
      localStorage.setItem('employeeId', user.employeeId.toString());

      return {
        accessToken: mockToken,
        tokenType: 'Bearer',
        expiresIn: 3600,
      };
    }

    try {
      const formData = new URLSearchParams();
      formData.append('grant_type', 'password');
      formData.append('username', data.username);
      formData.append('password', data.password);
      formData.append('client_id', 'staff-client');

      const tokenUrl = import.meta.env.VITE_OAUTH_TOKEN_URL || 'http://localhost:8081/oauth2/token';
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error('Invalid username or password');
      }

      const tokenData = await response.json();
      const accessToken = tokenData.access_token;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('tokenType', tokenData.token_type || 'Bearer');
      localStorage.setItem('expiresIn', tokenData.expires_in?.toString() || '3600');

      try {
        const employeeResponse = await apiClient.get<EmployeeResponseDto>('/employees/me');
        localStorage.setItem('employeeId', employeeResponse.data.id.toString());
        return {
          accessToken,
          tokenType: tokenData.token_type || 'Bearer',
          expiresIn: tokenData.expires_in || 3600,
          employee: employeeResponse.data,
        };
      } catch {
        return {
          accessToken,
          tokenType: tokenData.token_type || 'Bearer',
          expiresIn: tokenData.expires_in || 3600,
        };
      }
    } catch (error) {
      throw extractApiError(error);
    }
  },

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('expiresIn');
    localStorage.removeItem('employeeId');
    window.location.href = '/auth';
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  getEmployeeId(): number | null {
    const id = localStorage.getItem('employeeId');
    return id ? Number(id) : null;
  },
};

