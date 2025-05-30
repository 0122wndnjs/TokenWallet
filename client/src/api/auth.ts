// TokenWallet/client/src/api/auth.ts

import axiosClient from './axiosClient';
import { LoginPayload, RegisterPayload, AuthResponse, UserInfo } from '../types/auth';

export const login = async (credentials: LoginPayload): Promise<AuthResponse> => {
  try {
    const response = await axiosClient.post<AuthResponse>('/auth/login', credentials); // ✨ /api 제거
    return response.data;
  } catch (error) {
    console.error("Login API error:", error);
    throw error;
  }
};

export const register = async (userData: RegisterPayload): Promise<AuthResponse> => {
  try {
    const response = await axiosClient.post<AuthResponse>('/auth/register', userData); // ✨ /api 제거
    return response.data;
  } catch (error) {
    console.error("Register API error:", error);
    throw error;
  }
};

export const logout = async (): Promise<{ message: string }> => {
  try {
    const response = await axiosClient.post<{ message: string }>('/auth/logout'); // ✨ /api 제거
    return response.data;
  } catch (error) {
    console.error("Logout API error:", error);
    throw error;
  }
};

export const fetchCurrentUser = async (): Promise<UserInfo> => {
  try {
    const response = await axiosClient.get<UserInfo>('/users/me'); // ✨ /api 제거
    return response.data;
  } catch (error) {
    console.error("Fetch current user API error:", error);
    throw error;
  }
};