// TokenWallet/client/src/components/admin/UserManagementTable.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; // AuthContext에서 토큰 가져오기

// 사용자 데이터 타입 정의 (백엔드 응답과 일치해야 합니다.)
interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phoneNumber?: string; // nullable
  walletAddress?: string; // nullable
  role: 'user' | 'admin'; // 백엔드 UserRole enum과 일치
  createdAt: string;
  updatedAt: string;
}

export const UserManagementTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, accessToken } = useAuth(); // 현재 로그인한 사용자 정보 및 토큰

  useEffect(() => {
    const fetchUsers = async () => {
      if (!accessToken) {
        setError('인증 토큰이 없습니다. 로그인해주세요.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 백엔드 /admin/users 엔드포인트 호출
        const response = await axios.get<User[]>('http://localhost:3000/admin/users', {
          headers: {
            Authorization: `Bearer ${accessToken}`, // JWT 토큰을 Authorization 헤더에 추가
          },
        });
        setUsers(response.data);
      } catch (err) {
        console.error('사용자 데이터를 불러오는 중 오류 발생:', err);
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 403) {
            setError('접근 권한이 없습니다. 어드민 계정으로 로그인했는지 확인해주세요.');
          } else {
            setError(`데이터 로드 실패: ${err.response?.data?.message || err.message}`);
          }
        } else {
          setError('알 수 없는 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [accessToken]); // accessToken이 변경될 때마다 데이터를 다시 불러옵니다.

  if (loading) {
    return <div className="text-center py-4">사용자 목록을 불러오는 중...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-4">{error}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-700 text-left text-white text-bold uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">사용자명</th>
            <th className="py-3 px-6 text-left">이름</th>
            <th className="py-3 px-6 text-left">이메일</th>
            <th className="py-3 px-6 text-left">전화번호</th>
            <th className="py-3 px-6 text-left">지갑 주소</th>
            <th className="py-3 px-6 text-left">역할</th>
            <th className="py-3 px-6 text-left">가입일</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-6 text-left">{user.username}</td>
              <td className="py-3 px-6 text-left">{user.name}</td>
              <td className="py-3 px-6 text-left">{user.email}</td>
              <td className="py-3 px-6 text-left">{user.phoneNumber || '-'}</td>
              <td className="py-3 px-6 text-left">{user.walletAddress?.substring(0, 8)}...{user.walletAddress?.substring(user.walletAddress.length - 6) || '-'}</td>
              <td className="py-3 px-6 text-left font-semibold">
                <span className={`py-1 px-3 rounded-full text-xs ${user.role === 'admin' ? 'bg-red-200 text-red-600' : 'bg-blue-200 text-blue-600'}`}>
                  {user.role === 'admin' ? '어드민' : '일반 사용자'}
                </span>
              </td>
              <td className="py-3 px-6 text-left">{new Date(user.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};