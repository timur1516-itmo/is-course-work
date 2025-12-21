import { apiClient, extractApiError } from './config';

export type AccountRole = 
  | 'CLIENT'
  | 'SALES_MANAGER'
  | 'CONSTRUCTOR'
  | 'CNC_OPERATOR'
  | 'WAREHOUSE_WORKER'
  | 'SUPPLY_MANAGER'
  | 'ADMIN';

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  role: AccountRole;
}

export interface ClientRegistrationRequestDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface ClientRegistrationResponseDto {
  clientId: number;
  accountId: number;
  email: string;
  enabled: boolean;
}

export interface CurrentUserDto {
  accountId: number;
  username: string;
  role: AccountRole;
  person?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  client?: {
    id: number;
    email: string;
    phoneNumber: string;
    person: {
      id: number;
      firstName: string;
      lastName: string;
    };
    accountId: number;
  };
}

export interface UpdateProfileRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  async login(data: LoginRequestDto): Promise<LoginResponseDto> {
    try {
      const response = await apiClient.post<LoginResponseDto>('/login', data);
      const loginData = response.data;
      
      localStorage.setItem('accessToken', loginData.accessToken);
      localStorage.setItem('tokenType', loginData.tokenType);
      localStorage.setItem('expiresIn', loginData.expiresIn.toString());
      localStorage.setItem('role', loginData.role);
      
      return loginData;
    } catch (error) {
      throw extractApiError(error);
    }
  },

  async register(data: ClientRegistrationRequestDto): Promise<ClientRegistrationResponseDto> {
    try {
      const response = await apiClient.post<ClientRegistrationResponseDto>('/register', data);
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('expiresIn');
    localStorage.removeItem('role');
    localStorage.removeItem('employeeId');
    window.location.href = '/auth';
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  getRole(): AccountRole | null {
    return (localStorage.getItem('role') as AccountRole) || null;
  },

  getEmployeeId(): number | null {
    const id = localStorage.getItem('employeeId');
    return id ? Number(id) : null;
  },

  async getCurrentUser(): Promise<CurrentUserDto> {
    try {
      const response = await apiClient.get<CurrentUserDto>('/me');
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },

  async updateProfile(data: UpdateProfileRequestDto): Promise<void> {
    try {
      await apiClient.put('/me', data);
    } catch (error) {
      throw extractApiError(error);
    }
  },

  async changePassword(data: ChangePasswordRequestDto): Promise<void> {
    try {
      await apiClient.post('/change-password', data);
    } catch (error) {
      throw extractApiError(error);
    }
  },
};

