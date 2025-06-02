// TokenWallet/client/src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
// import axios from 'axios'; // ✨ axios 직접 임포트 대신 API 함수 임포트
import { AuthResponse, LoginPayload, UserInfo, RegisterPayload } from '../types/auth';
// ✨ API 함수 임포트
import { login as loginApi, register as registerApi, logout as logoutApi, fetchCurrentUser as fetchCurrentUserApi } from '../api/auth';

// UserInfo 타입에 이미 role이 포함되어 있으므로, 별도의 AuthUser 확장은 불필요합니다.
// interface AuthUser extends UserInfo {
//   role: 'user' | 'admin';
// }

// AuthContext가 제공할 값들의 타입 정의
interface AuthContextType {
  user: UserInfo | null; // ✨ UserInfo 타입으로 사용
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginPayload) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null); // ✨ UserInfo 타입으로 사용
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = useCallback(async (token: string) => {
    try {
      // ✨ src/api/auth.ts에서 임포트한 fetchCurrentUserApi 사용
      const currentUserInfo = await fetchCurrentUserApi(); // 이 함수는 토큰을 axiosClient에서 자동으로 처리
      setUser(currentUserInfo); // ✨ UserInfo 타입 사용
      setIsAuthenticated(true);
      setLoading(false);
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
      localStorage.removeItem('accessToken');
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAccessToken(token);
      fetchCurrentUser(token); // 토큰을 인자로 전달하여 사용자 정보 로드
    } else {
      setLoading(false);
    }
  }, [fetchCurrentUser]);

  const login = async (credentials: LoginPayload): Promise<AuthResponse> => {
    try {
      // ✨ src/api/auth.ts에서 임포트한 loginApi 사용
      const response = await loginApi(credentials);
      const { accessToken, user } = response; // 응답 객체에서 직접 accessToken과 user 추출

      setUser(user); // ✨ UserInfo 타입 사용
      setAccessToken(accessToken);
      setIsAuthenticated(true);
      localStorage.setItem('accessToken', accessToken);
      return response; // AuthResponse 전체 반환
    } catch (error: any) {
      console.error('로그인 실패:', error);
      setIsAuthenticated(false);
      throw error.response?.data || error.message;
    }
  };

  const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
    try {
      // ✨ src/api/auth.ts에서 임포트한 registerApi 사용
      const response = await registerApi(payload);
      return response;
    } catch (error: any) {
      console.error('회원가입 실패:', error);
      throw error.response?.data || error.message;
    }
  };

  const logout = () => {
    // ✨ src/api/auth.ts에서 임포트한 logoutApi 사용 (백엔드 로그아웃 API 호출)
    logoutApi().catch(err => console.error("백엔드 로그아웃 실패:", err)); // 비동기 호출이지만 상태 업데이트는 바로
    localStorage.removeItem('accessToken');
    setUser(null);
    setAccessToken(null);
    setIsAuthenticated(false);
  };

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      await fetchCurrentUser(token);
    } else {
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);
    }
  }, [fetchCurrentUser]);

  const contextValue = {
    user,
    accessToken,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};