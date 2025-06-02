// TokenWallet/client/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './routes/AppRouter'; // AppRouter 경로 확인
import './index.css'; // Tailwind CSS 또는 기타 전역 스타일
import { AuthProvider } from './context/AuthContext'; // ✨ AuthProvider 임포트

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider> {/* ✨ AuthProvider로 AppRouter를 감쌉니다. */}
      <AppRouter />
    </AuthProvider>
  </React.StrictMode>,
);