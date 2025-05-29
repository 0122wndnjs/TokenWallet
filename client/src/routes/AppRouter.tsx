// TokenWallet/client/src/routes/AppRouter.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 페이지 컴포넌트들을 임포트합니다.
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
// import WalletDashboardPage from '../pages/wallet/WalletDashboardPage'; // 나중에 만들 대시보드 페이지
import NotFoundPage from '../pages/NotFoundPage'; // 404 페이지

/**
 * ProtectedRoute 컴포넌트: 인증된 사용자만 접근 가능한 경로를 보호합니다.
 * 실제 애플리케이션에서는 Redux, Zustand 또는 Context API를 사용하여
 * 전역 인증 상태를 확인하는 것이 더 견고한 방법입니다.
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 로컬 스토리지에 'accessToken'이 있는지 확인하여 로그인 여부를 판단합니다.
  const isAuthenticated = localStorage.getItem('accessToken');

  if (!isAuthenticated) {
    // 토큰이 없으면 로그인 페이지로 강제 이동시킵니다.
    return <Navigate to="/login" replace />;
  }
  // 토큰이 있으면 요청된 자식 컴포넌트를 렌더링합니다.
  return <>{children}</>;
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* 공개적으로 접근 가능한 경로 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 기본 경로('/')로 접속 시 로그인 페이지로 리다이렉트 */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 보호된 경로 예시 (로그인이 필요한 페이지) */}
        {/*
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <WalletDashboardPage /> // 이 페이지는 로그인해야 접근 가능합니다.
              </ProtectedRoute>
            }
          />
        */}
        {/* 지갑 관련 페이지들도 ProtectedRoute로 감싸야 합니다. */}
        {/*
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <WalletDashboardPage /> // 지갑 대시보드 페이지
              </ProtectedRoute>
            }
          />
        */}

        {/* 일치하는 경로가 없을 경우 404 Not Found 페이지 표시 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;