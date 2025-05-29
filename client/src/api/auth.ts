// TokenWallet/client/src/api/auth.ts

import axiosClient from './axiosClient';
import { LoginPayload, RegisterPayload, AuthResponse } from '../types/auth';

/**
 * 로그인 API를 호출하는 함수입니다.
 * 사용자 이름과 비밀번호를 백엔드의 /auth/login 엔드포인트로 전송합니다.
 *
 * @param credentials LoginPayload 타입의 객체 (username, password)
 * @returns Promise<AuthResponse> 로그인 성공 시 서버로부터 받은 응답 (message, accessToken, user 정보)
 */
export const login = async (credentials: LoginPayload): Promise<AuthResponse> => {
  try {
    const response = await axiosClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error("Login API error:", error);
    throw error;
  }
};

/**
 * 회원가입 API를 호출하는 함수입니다.
 * 회원가입에 필요한 사용자 정보를 백엔드의 /auth/register 엔드포인트로 전송합니다.
 *
 * @param userData RegisterPayload 타입의 객체 (username, name, password, phoneNumber, email)
 * @returns Promise<AuthResponse> 회원가입 성공 시 서버로부터 받은 응답 (message, accessToken, user 정보)
 */
export const register = async (userData: RegisterPayload): Promise<AuthResponse> => {
  try {
    const response = await axiosClient.post<AuthResponse>('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error("Register API error:", error);
    throw error;
  }
};

/**
 * 로그아웃 API를 호출하는 함수입니다. (선택 사항)
 * JWT 기반 인증에서는 클라이언트 측에서 토큰을 삭제하는 것이 주된 로그아웃 방식입니다.
 * 이 서버 측 엔드포인트는 API 일관성을 위한 것이거나,
 * 나중에 서버 측 토큰 블랙리스트 구현 시 사용될 수 있습니다.
 *
 * @returns Promise<{ message: string }> 로그아웃 성공 시 서버로부터 받은 메시지
 */
export const logout = async (): Promise<{ message: string }> => {
  try {
    const response = await axiosClient.post<{ message: string }>('/auth/logout');
    return response.data;
  } catch (error) {
    console.error("Logout API error:", error);
    throw error;
  }
};