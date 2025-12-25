import axios, {AxiosError, type AxiosInstance} from 'axios';

export const GATEWAY_BASE_URL = import.meta.env.VITE_GATEWAY_BASE_URL || 'http://localhost:8080';

const API_BASE_URL = `${GATEWAY_BASE_URL}/resource`;

export const LOGIN_URL = `${GATEWAY_BASE_URL}/oauth2/authorization/gateway`;

export const gatewayClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let redirectingToLogin = false;

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (!redirectingToLogin)
        redirectingToLogin = true;
      const returnTo = window.location.href;
      window.location.href = `${LOGIN_URL}?returnTo=${encodeURIComponent(returnTo)}`;
    }
    return Promise.reject(error);
  }
);

export interface ApiError {
  code?: string;
  message?: string;
  details?: unknown;
  title?: string;
  status?: number;
  detail?: string;
}

export function extractApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    return error.response?.data as ApiError || {
      message: error.message || 'Произошла ошибка при выполнении запроса',
    };
  }
  return {
    message: 'Неизвестная ошибка',
  };
}

