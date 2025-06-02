// TokenWallet/client/src/components/admin/AdminHeader.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AdminHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login'); // 로그아웃 후 어드민 로그인 페이지로 리다이렉트
  };

  return (
    // ✨ justify-end 클래스를 추가하여 내부 요소들을 오른쪽 끝으로 정렬합니다.
    <header className="fixed top-0 left-64 right-0 bg-white shadow-sm h-16 flex items-center justify-end px-8 z-30">
      <div className="flex items-center space-x-4">
        {user && (
          <span className="text-gray-700 text-sm">
            환영합니다, <span className="font-semibold">{user.username}</span>님 ({user.role})
          </span>
        )}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 px-4 rounded-md transition duration-300"
        >
          로그아웃
        </button>
      </div>
    </header>
  );
};