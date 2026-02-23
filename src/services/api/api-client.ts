import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

import { API } from '@/constants';
import { store } from '@/store';
import { logout } from '@/store/slices/auth.slice';

export interface ApiResponse<T = unknown> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface ApiErrorResponse {
  message: string;
  success: false;
  errors?: Record<string, string[]>;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: `${API.BASE_URL}/${API.VERSION}`,
  timeout: API.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (!config.headers.get('Authorization')) {
      const token = store.getState().auth.accessToken;
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return config;
  },
  (error: AxiosError): Promise<never> => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError<ApiErrorResponse>): Promise<never> => {
    if (error.response?.status === 401) {
      await store.dispatch(logout());
    }

    return Promise.reject(error);
  },
);

export default apiClient;
