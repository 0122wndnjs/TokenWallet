// TokenWallet/client/src/components/admin/UserManagementTable.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { UserInfo } from "../../types/auth";
import { UserDetailModal } from "./UserDetailModal";
import axiosClient from "../../api/axiosClient";
import { toast } from 'react-toastify';

export const UserManagementTable: React.FC = () => {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("username");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const searchFieldDisplayNames: { [key: string]: string } = {
    username: '사용자명',
    name: '이름',
    email: '이메일',
    phoneNumber: '전화번호',
    walletAddress: '지갑 주소',
    role: '역할',
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get(`/admin/users`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          page: currentPage,
          limit: limit,
          searchQuery: searchQuery,
          searchField: searchField,
        },
      });
      setUsers(response.data.data);
      setTotalUsers(response.data.total);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("사용자 목록을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, currentPage, limit, searchQuery, searchField]);

  useEffect(() => {
    if (accessToken) {
      fetchUsers();
    } else {
      setLoading(false);
      setError(
        "인증 토큰이 없어 사용자 목록을 불러올 수 없습니다. 로그인해주세요."
      );
    }
  }, [fetchUsers, accessToken]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchField(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  // ✨ handleRoleChange 함수의 newRole 타입을 'user' | 'admin' 리터럴 유니온으로 변경
const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    // 역할 변경은 중요한 작업이므로 window.confirm()은 유지하는 것이 좋습니다.
    if (!window.confirm(`${userId} 사용자의 역할을 ${newRole}으로 변경하시겠습니까?`)) {
      return;
    }
    if (!accessToken) { 
      toast.error("인증 토큰이 없어 역할을 변경할 수 없습니다.");
      return;
    }
    try {
      await axiosClient.patch(
        `/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${accessToken}` } }, 
      );
      toast.success("역할이 성공적으로 변경되었습니다.");
      fetchUsers(); 
    } catch (err) {
      console.error("Error updating role:", err);
      toast.error("역할 변경에 실패했습니다."); 
    }
  };


  const openUserDetailModal = (userId: string) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  const closeUserDetailModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
    fetchUsers();
  };

  const handleUserUpdated = () => {
    fetchUsers();
  };

  const totalPages = Math.ceil(totalUsers / limit);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">사용자 관리</h2>

      {/* 검색 및 필터링 폼 */}
      <form
        onSubmit={handleSearchSubmit}
        className="mb-6 flex space-x-4 items-center"
      >
        <select
          value={searchField}
          onChange={handleSearchFieldChange}
          className="p-2 border border-gray-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          placeholder={`${searchFieldDisplayNames[searchField]} 검색...`} 
          value={searchQuery}
          onChange={handleSearchChange}
          className="flex-1 p-2 border border-gray-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
        >
          검색
        </button>
      </form>

      {loading && <p className="text-blue-500">사용자 목록을 불러오는 중...</p>}
      {error && <p className="text-red-500">오류: {error}</p>}

      {!loading && !error && users.length === 0 && (
        <p className="text-gray-600">검색 결과가 없습니다.</p>
      )}

      {!loading && users.length > 0 && (
        <>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 border-b">ID</th>
                  <th className="py-3 px-6 border-b">사용자명</th>
                  <th className="py-3 px-6 border-b">이름</th>
                  <th className="py-3 px-6 border-b">이메일</th>
                  <th className="py-3 px-6 border-b">전화번호</th>
                  <th className="py-3 px-6 border-b">지갑 주소</th>
                  <th className="py-3 px-6 border-b">역할</th>
                  <th className="py-3 px-6 border-b">가입일</th>
                  {/* <th className="py-3 px-6 border-b">액션</th> */}
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm font-light">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                    onClick={() => openUserDetailModal(user.id)}
                  >
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      {user.id.substring(0, 8)}...
                    </td>
                    <td className="py-3 px-6 text-left">{user.username}</td>
                    <td className="py-3 px-6 text-left">{user.name}</td>
                    <td className="py-3 px-6 text-left">{user.email}</td>
                    <td className="py-3 px-6 text-left">{user.phoneNumber}</td>
                    <td className="py-3 px-6 text-left">
                      {user.walletAddress?.substring(0, 10)}...
                    </td>
                    <td className="py-3 px-6 text-left">
                      <span
                        className={`py-1 px-3 rounded-full text-xs ${
                          // ✨ UserInfo.role은 'user' | 'admin' 타입이므로 직접 비교
                          user.role === "admin"
                            ? "bg-red-200 text-red-700"
                            : "bg-green-200 text-green-700"
                        }`}
                      >
                        {user.role === "admin" ? "어드민" : "일반"}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-left">
                      {" "}
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    {/* <td className="py-3 px-6 text-left">
                      {user.role === "user" ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRoleChange(user.id, "admin"); // ✨ 'admin' 문자열 리터럴 사용
                          }}
                          className="bg-purple-500 text-white px-3 py-1 rounded-md hover:bg-purple-600 text-xs"
                        >
                          어드민으로 변경
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRoleChange(user.id, "user"); // ✨ 'user' 문자열 리터럴 사용
                          }}
                          className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 text-xs"
                        >
                          일반 유저로 변경
                        </button>
                      )}
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
            >
              이전
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
            >
              다음
            </button>
          </div>
        </>
      )}

      {/* UserDetailModal 렌더링 */}
      {isModalOpen && selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          onClose={closeUserDetailModal}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  );
};
