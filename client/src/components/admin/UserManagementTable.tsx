// TokenWallet/client/src/components/admin/UserManagementTable.tsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; // AuthContext에서 토큰 가져오기
import debounce from 'lodash.debounce'; // ✨ 디바운스 임포트

// 사용자 데이터 타입 정의 (백엔드 응답과 일치해야 합니다.)
interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phoneNumber?: string;
  walletAddress?: string;
  role: 'user' | 'admin'; // 백엔드 UserRole enum과 일치
  createdAt: string;
  updatedAt: string;
}

// ✨ 드롭다운 역할 변경을 위한 타입
type UserRoleOption = 'user' | 'admin';

export const UserManagementTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // ✨ 페이지네이션 및 검색 관련 상태
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10); // 페이지당 사용자 수 (원하는 값으로 변경 가능)
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchField, setSearchField] = useState<string>('username'); // 기본 검색 필드
  
  const { user: currentUser, accessToken } = useAuth(); // 현재 로그인한 어드민 사용자 정보 및 토큰

  // ✨ 사용자 데이터를 백엔드에서 불러오는 함수 (페이지네이션 및 검색 포함)
  const fetchUsers = useCallback(async () => {
    if (!accessToken) {
      setError('인증 토큰이 없습니다. 로그인해주세요.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // 백엔드 /admin/users 엔드포인트 호출 (쿼리 파라미터 추가)
      const response = await axios.get<{ data: User[]; total: number }>( // ✨ 응답 타입 변경
        `http://localhost:3000/admin/users?page=${page}&limit=${limit}&searchQuery=${searchQuery}&searchField=${searchField}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setUsers(response.data.data); // ✨ data 필드 사용
      setTotalUsers(response.data.total); // ✨ total 필드 사용
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
  }, [accessToken, page, limit, searchQuery, searchField]); // ✨ 의존성 배열에 추가

  // ✨ 검색어 입력 시 디바운스 적용하여 API 호출
  const debouncedFetchUsers = useCallback(
    debounce(() => {
      setPage(1); // 검색어가 변경되면 첫 페이지로 리셋
      fetchUsers();
    }, 500), // 500ms 디바운스
    [fetchUsers]
  );

  useEffect(() => {
    fetchUsers(); // 초기 로드 및 페이지/리밋/검색 조건 변경 시 호출
  }, [fetchUsers]); // fetchUsers가 변경될 때마다 호출

  // ✨ 검색어 입력 핸들러
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    debouncedFetchUsers(); // 디바운스된 함수 호출
  };

  // ✨ 검색 필드 변경 핸들러
  const handleSearchFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchField(e.target.value);
    setPage(1); // 필드가 변경되면 첫 페이지로 리셋
    fetchUsers(); // 즉시 데이터 다시 불러오기
  };

  // ✨ 역할 변경 핸들러
  const handleRoleChange = async (userId: string, newRole: UserRoleOption) => {
    if (!accessToken) {
      alert('인증 토큰이 없습니다. 로그인해주세요.');
      return;
    }

    // 현재 사용자 본인의 역할은 변경할 수 없도록 제한 (선택 사항)
    if (currentUser?.id === userId) {
      alert('본인의 역할은 변경할 수 없습니다.');
      return;
    }

    if (!window.confirm(`${userId} 사용자의 역할을 ${newRole}로 변경하시겠습니까?`)) {
      return;
    }

    try {
      await axios.patch(
        `http://localhost:3000/admin/users/${userId}/role`,
        { role: newRole }, // 변경할 역할 전송
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      // 역할 변경 성공 시, UI를 업데이트하기 위해 사용자 목록을 다시 불러옵니다.
      fetchUsers();
      alert('사용자 역할이 성공적으로 변경되었습니다.');
    } catch (err) {
      console.error('역할 변경 중 오류 발생:', err);
      if (axios.isAxiosError(err)) {
        alert(`역할 변경 실패: ${err.response?.data?.message || err.message}`);
      } else {
        alert('알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  const totalPages = Math.ceil(totalUsers / limit);

  if (loading) {
    return <div className="text-center py-4">사용자 목록을 불러오는 중...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        {/* ✨ 검색 UI */}
        <div className="flex items-center space-x-2">
          <select
            className="border border-gray-300 p-2 rounded-md text-gray-800"
            value={searchField}
            onChange={handleSearchFieldChange}
          >
            <option value="username">사용자명</option>
            <option value="name">이름</option>
            <option value="email">이메일</option>
            <option value="phoneNumber">전화번호</option>
            <option value="walletAddress">지갑 주소</option>
            <option value="role">역할</option>
          </select>
          <input
            type="text"
            placeholder={`검색어를 입력하세요 (${
              searchField === 'walletAddress' ? '일부 주소' : searchField
            })`}
            className="border border-gray-300 text-gray-800 p-2 rounded-md w-64"
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
        </div>

        {/* ✨ 페이지당 항목 수 선택 */}
        <div className="flex items-center space-x-2">
          <label htmlFor="limit-select" className="text-gray-700 text-sm">
            페이지당:
          </label>
          <select
            id="limit-select"
            className="border border-gray-300 p-2 rounded-md text-gray-800"
            value={limit}
            onChange={(e) => {
              setLimit(parseInt(e.target.value, 10));
              setPage(1); // limit 변경 시 첫 페이지로 리셋
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-700 text-left text-white font-bold uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">사용자명</th>
              <th className="py-3 px-6 text-left">이름</th>
              <th className="py-3 px-6 text-left">이메일</th>
              <th className="py-3 px-6 text-left">전화번호</th>
              <th className="py-3 px-6 text-left">지갑 주소</th>
              <th className="py-3 px-6 text-left">역할</th>
              <th className="py-3 px-6 text-left">가입일</th>
              {/* ✨ 어드민에게만 역할 변경 액션 컬럼 표시 */}
              {/* {currentUser?.role === 'admin' && (
                <th className="py-3 px-6 text-center">액션</th>
              )} */}
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {users.length === 0 ? (
              <tr>
                <td colSpan={currentUser?.role === 'admin' ? 8 : 7} className="py-6 text-center">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left">{user.username}</td>
                  <td className="py-3 px-6 text-left">{user.name}</td>
                  <td className="py-3 px-6 text-left">{user.email}</td>
                  <td className="py-3 px-6 text-left">{user.phoneNumber || '-'}</td>
                  <td className="py-3 px-6 text-left text-xs">
                    {user.walletAddress
                      ? `${user.walletAddress.substring(0, 8)}...${user.walletAddress.substring(
                          user.walletAddress.length - 6,
                        )}`
                      : '-'}
                  </td>
                  <td className="py-3 px-6 text-left font-semibold">
                    <span
                      className={`py-1 px-3 rounded-full text-xs ${
                        user.role === 'admin'
                          ? 'bg-red-200 text-red-600'
                          : 'bg-blue-200 text-blue-600'
                      }`}
                    >
                      {user.role === 'admin' ? 'ADMIN' : '회원'}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-left">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  {/* ✨ 역할 변경 드롭다운 */}
                  {/* {currentUser?.role === 'admin' && (
                    <td className="py-3 px-6 text-center">
                      <select
                        className="border border-gray-300 p-2 rounded-md text-xs"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRoleOption)}
                      >
                        <option value="user">USER</option>
                        <option value="admin">ADMIN</option>
                      </select>
                    </td>
                  )} */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ✨ 페이지네이션 컨트롤 */}
      <div className="flex justify-between items-center mt-4">
        <button
          // 이전 버튼: 배경색을 더 밝게 하고 텍스트는 짙은 색으로 유지하거나,
          // 배경색을 짙게 하고 텍스트를 흰색으로 변경
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-l disabled:opacity-50" // ✨ 색상 변경
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          이전
        </button>
        <span className="text-gray-700 text-sm">
          페이지 {page} / {totalPages}
        </span>
        <button
          // 다음 버튼: 이전 버튼과 동일하게 색상 변경
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-r disabled:opacity-50" // ✨ 색상 변경
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages || totalPages === 0}
        >
          다음
        </button>
      </div>
    </div>
  );
};