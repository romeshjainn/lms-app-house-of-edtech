import apiClient from '../api-client';
import type { ApiResponse } from '../api-client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: 'student' | 'instructor' | 'admin';
  created_at: string;
}

export interface AuthPayload {
  token: string;
  user: AuthUser;
}

async function login(payload: LoginRequest): Promise<ApiResponse<AuthPayload>> {
  const response = await apiClient.post<ApiResponse<AuthPayload>>(
    '/auth/login',
    payload,
  );
  return response.data;
}

async function register(
  payload: RegisterRequest,
): Promise<ApiResponse<AuthPayload>> {
  const response = await apiClient.post<ApiResponse<AuthPayload>>(
    '/auth/register',
    payload,
  );
  return response.data;
}

async function logoutSession(): Promise<ApiResponse<null>> {
  const response = await apiClient.post<ApiResponse<null>>('/auth/logout');
  return response.data;
}

export const authService = {
  login,
  register,
  logoutSession,
};
