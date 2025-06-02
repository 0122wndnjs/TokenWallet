// TokenWallet/client/src/pages/admin/AdminLoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoginPayload } from '../../types/auth'; // 로그인 페이로드 타입 임포트

const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // AuthContext의 로그인 함수 사용

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const credentials: LoginPayload = { username, password };
      const response = await login(credentials); // 로그인 시도 (AuthContext의 login 함수 사용)

      // 로그인 성공 시 응답에서 user.role을 확인
      if (response.user && response.user.role === 'admin') {
        navigate('/admin'); // 어드민 역할이면 어드민 대시보드로 이동
      } else {
        // 어드민이 아니면 에러 메시지 표시 또는 일반 유저 대시보드로 리다이렉션
        setError('어드민 권한이 없는 계정입니다.');
        // 선택 사항: 일반 사용자는 강제로 로그아웃 시키거나 다른 페이지로 보냄
        // logout();
        // navigate('/login');
      }
    } catch (err: any) {
      console.error('관리자 로그인 실패:', err);
      setError(err?.message || '로그인 실패: 사용자 이름 또는 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-black text-center mb-6">어드민 로그인</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
              사용자 이름
            </label>
            <input
              type="text"
              id="username"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;