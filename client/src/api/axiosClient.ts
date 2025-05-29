// TokenWallet/client/src/api/axiosClient.ts

import axios from 'axios';

// 백엔드 서버의 기본 URL을 설정합니다.
// NestJS 서버가 3000번 포트에서 실행 중이라고 가정합니다.
const API_BASE_URL = 'http://localhost:3000';

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
    // 'accessToken'은 로그인 성공 시 로컬 스토리지에 저장한 JWT 토큰의 키 이름입니다.
    const token = localStorage.getItem('accessToken');

    // 토큰이 존재하면 Authorization 헤더에 'Bearer ' 접두사와 함께 추가합니다.
    // 'Bearer' 스키마는 JWT 인증의 표준 방식입니다.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // 수정된 요청 설정을 반환하여 다음 미들웨어로 전달합니다.
  },
  (error) => {
    // 요청을 보내기 전에 에러가 발생한 경우 처리합니다.
    console.error("Axios request interceptor error:", error);
    return Promise.reject(error);
  }
);

// --- 응답 인터셉터 설정 ---
// 서버로부터 응답을 받은 후, 응답이 컴포넌트/함수로 전달되기 전에 가로채서 특정 작업을 수행합니다.
// 이 인터셉터는 401 Unauthorized 에러 발생 시 자동으로 로그아웃 처리하는 로직을 추가합니다.
axiosClient.interceptors.response.use(
  (response) => {
    // 성공적인 응답은 그대로 반환합니다.
    return response;
  },
  (error) => {
    // 응답 에러가 있고, HTTP 상태 코드가 401 (Unauthorized)인 경우
    // 이는 토큰이 만료되었거나 유효하지 않음을 의미할 수 있습니다.
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized error: Token expired or invalid. Logging out...');
      // 1. 로컬 스토리지에서 JWT 토큰을 삭제합니다.
      localStorage.removeItem('accessToken');
      // 2. (선택 사항) 사용자에게 세션 만료 알림을 표시합니다.
      alert('세션이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.');
      // 3. (선택 사항) 사용자를 로그인 페이지로 강제 리다이렉션합니다.
      //    🚨 주의: 이 코드는 브라우저 환경에서만 작동하며, React Router의 `Maps` 훅을
      //    사용하는 것이 더 React스러운 방법입니다. 여기서는 단순 예시입니다.
      //    window.location.href = '/login';
    }
    // 발생한 에러를 다시 throw하여 Promise 체인의 다음 `catch` 블록으로 전달합니다.
    return Promise.reject(error);
  }
);

export default axiosClient;