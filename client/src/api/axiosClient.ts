// TokenWallet/client/src/api/axiosClient.ts

import axios from 'axios';

// 백엔드 서버의 기본 URL을 설정합니다.
// NestJS 서버가 3000번 포트에서 실행 중이라고 가정합니다.
const API_BASE_URL = 'http://localhost:3000'; // ✨ 이 부분을 http://localhost:3000 으로 변경합니다.

// axios 인스턴스를 생성합니다.
// 이렇게 생성된 인스턴스를 통해 모든 API 요청에 공통 설정이 적용됩니다.
const axiosClient = axios.create({
  baseURL: API_BASE_URL, // 모든 요청의 기본 URL
  headers: {
    'Content-Type': 'application/json', // 기본적으로 JSON 형식으로 데이터를 보냅니다.
  },
  timeout: 10000, // 요청 타임아웃 10초 설정 (선택 사항)
});

// --- 요청 인터셉터 설정 ---
// HTTP 요청이 서버로 전송되기 전에 가로채서 특정 작업을 수행합니다.
// 이 인터셉터는 로컬 스토리지에 저장된 JWT 토큰을 요청 헤더에 자동으로 추가합니다.
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Axios request interceptor error:", error);
    return Promise.reject(error);
  }
);

// --- 응답 인터셉터 설정 ---
// 서버로부터 응답을 받은 후, 응답이 컴포넌트/함수로 전달되기 전에 가로채서 특정 작업을 수행합니다.
// 이 인터셉터는 401 Unauthorized 에러 발생 시 자동으로 로그아웃 처리하는 로직을 추가합니다.
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized error: Token expired or invalid. Logging out...');
      localStorage.removeItem('accessToken');
      alert('세션이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.');
    }
    return Promise.reject(error);
  }
);

export default axiosClient;