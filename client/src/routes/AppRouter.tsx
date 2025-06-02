// TokenWallet/client/src/routes/AppRouter.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'; // ✨ Outlet 임포트

// 페이지 컴포넌트들을 임포트합니다.
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import WalletDashboardPage from '../pages/dashboard/DashboardPage';
import NotFoundPage from '../pages/NotFoundPage';

// 어드민 관련 페이지 컴포넌트 임포트
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminLoginPage from '../pages/admin/AdminLoginPage';

// AuthContext 임포트
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute 컴포넌트: 인증된 사용자만 접근 가능한 경로를 보호합니다.
 * 이 프로젝트에서는 AuthContext를 통해 전역 인증 상태를 확인합니다.
 * ✨ children prop을 제거하고 Outlet을 사용합니다.
 */
const ProtectedRoute: React.FC = () => { // ✨ { children: React.ReactNode } 타입 정의 제거
  const { isAuthenticated, loading } = useAuth(); // AuthContext에서 상태 가져오기

  if (loading) {
    return <div className="text-center py-8">인증 상태 로딩 중...</div>; // 로딩 중 UI
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  // ✨ 인증되면 중첩된 라우트를 렌더링하기 위해 Outlet을 사용합니다.
  return <Outlet />;
};

const AppRouter: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-8">애플리케이션 데이터 로딩 중...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* 공개적으로 접근 가능한 경로 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 어드민 전용 로그인 페이지 추가 */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* 보호된 경로 (로그인이 필요한 일반 사용자 페이지) */}
        {/* ✨ ProtectedRoute를 Route의 element로 사용하고, 중첩 라우트들을 자식으로 둡니다. */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<WalletDashboardPage />} />
          {/* <Route path="/wallet" element={<WalletDashboardPage />} /> */}
          {/* 다른 일반 사용자 전용 페이지들 (예: 송금 페이지 등) */}
          {/* <Route path="/send" element={<SendTokenPage />} /> */}
        </Route>

        {/* 어드민 대시보드 라우트 보호 */}
        <Route
          path="/admin"
          element={
            isAuthenticated && user?.role === 'admin' ? (
              <AdminDashboardPage />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />

        {/* 일치하는 경로가 없을 경우 404 Not Found 페이지 표시 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;