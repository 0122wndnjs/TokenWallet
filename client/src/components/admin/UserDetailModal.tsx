// TokenWallet/client/src/components/admin/UserDetailModal.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient'; 
import { UserInfo } from '../../types/auth'; 
import { toast } from 'react-toastify'; // ✨ toast 임포트 확인

interface UserDetailModalProps {
  userId: string;
  onClose: () => void;
  onUserUpdated: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  userId,
  onClose,
  onUserUpdated,
}) => {
  const { accessToken } = useAuth();

  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);

  const [editableName, setEditableName] = useState('');
  const [editableEmail, setEditableEmail] = useState('');
  const [editablePhoneNumber, setEditablePhoneNumber] = useState('');

  // 사용자 정보 불러오기
  useEffect(() => {
    const fetchUserDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosClient.get<UserInfo>(`/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const fetchedUser = response.data;
        console.log("Fetching user details for ID:", userId);
        console.log("Access Token:", accessToken);
        console.log("API response data:", response.data); 
        
        setUser(fetchedUser);
        setEditableName(fetchedUser.name || '');
        setEditableEmail(fetchedUser.email || '');
        setEditablePhoneNumber(fetchedUser.phoneNumber || '');
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError('사용자 상세 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (userId && accessToken) { 
      fetchUserDetail();
    } else if (!accessToken && !loading) { 
        setError('인증 토큰이 없습니다. 다시 로그인 해주세요.');
        setLoading(false);
    }
  }, [userId, accessToken]); 

  // 정보 수정 핸들러
  const handleUpdate = async () => {
    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    if (!accessToken) { 
      setUpdateError('인증 토큰이 없어 정보를 업데이트할 수 없습니다.');
      setIsUpdating(false);
      return;
    }

    try {
      const updateData = {
        name: editableName,
        email: editableEmail,
        phoneNumber: editablePhoneNumber,
      };

      await axiosClient.patch(`/admin/users/${userId}`, updateData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setUpdateSuccess(true);
      onUserUpdated();

    } catch (err) {
      console.error('Error updating user:', err);
      // axios import가 되어 있다면 axios.isAxiosError 사용 가능
      // 아니면 axiosClient.isAxiosError를 사용하거나, 에러 객체 자체를 확인
      if (axios.isAxiosError(err) && err.response) { 
        setUpdateError(err.response.data.message || '사용자 정보 업데이트에 실패했습니다.');
      } else {
        setUpdateError('사용자 정보 업데이트 중 알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsUpdating(false);
      setTimeout(() => {
        setUpdateSuccess(false);
        setUpdateError(null);
      }, 3000);
    }
  };

  const copyToClipboard = (text: string | undefined) => {
    if (text) {
      navigator.clipboard.writeText(text)
        .then(() => toast.success('지갑 주소가 복사되었습니다!')) // ✨ toast.success 사용
        .catch(err => {
          console.error('복사 실패:', err);
          toast.error('지갑 주소 복사에 실패했습니다.'); // ✨ toast.error 사용
        });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <p className="text-center text-gray-700">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <p className="text-center text-red-500">{error}</p>
          <div className="mt-4 text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; 
  }

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full relative">
        <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">
          사용자 상세 정보: {user.username}
        </h3>

        {/* 메시지 영역 */}
        {updateSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">정보가 성공적으로 업데이트되었습니다.</span>
          </div>
        )}
        {updateError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{updateError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
          {/* 읽기 전용 정보 */}
          <div>
            <label className="block text-gray-600 text-sm font-semibold mb-1">ID (UUID)</label>
            <p className="text-gray-900 bg-gray-100 p-2 rounded-md">{user.id}</p>
          </div>
          <div>
            <label className="block text-gray-600 text-sm font-semibold mb-1">사용자명</label>
            <p className="text-gray-900 bg-gray-100 p-2 rounded-md">{user.username}</p>
          </div>
          <div>
            <label className="block text-gray-600 text-sm font-semibold mb-1">지갑 주소</label>
            <div className="flex items-center bg-gray-100 rounded-md">
              <p className="text-gray-900 p-2 truncate">{user.walletAddress}</p>
              <button
                onClick={() => copyToClipboard(user.walletAddress)} 
                className="ml-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex-shrink-0"
                title="지갑 주소 복사"
              >
                📋 복사
              </button>
            </div>
          </div>
          <div>
            <label className="block text-gray-600 text-sm font-semibold mb-1">역할</label>
            <p className="text-gray-900 bg-gray-100 p-2 rounded-md">
              {user.role === 'admin' ? '어드민' : '일반 사용자'}
            </p>
          </div>
          <div>
            <label className="block text-gray-600 text-sm font-semibold mb-1">ETH 잔액</label>
            <p className="text-gray-900 bg-gray-100 p-2 rounded-md">
              {parseFloat(user.ethBalance).toFixed(4)} ETH ($ {(parseFloat(user.ethBalance) * user.ethPriceUsd).toFixed(2)})
            </p>
          </div>
          <div>
            <label className="block text-gray-600 text-sm font-semibold mb-1">커스텀 토큰 잔액</label>
            <p className="text-gray-900 bg-gray-100 p-2 rounded-md">{user.customTokenBalance} TOKEN</p>
          </div>
          <div>
            <label className="block text-gray-600 text-sm font-semibold mb-1">가입일</label>
            <p className="text-gray-900 bg-gray-100 p-2 rounded-md">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-gray-600 text-sm font-semibold mb-1">마지막 업데이트</label>
            <p className="text-gray-900 bg-gray-100 p-2 rounded-md">
              {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'N/A'}
            </p>
          </div>

          {/* 수정 가능한 정보 */}
          <div>
            <label htmlFor="name" className="block text-gray-600 text-sm font-semibold mb-1">이름</label>
            <input
              id="name"
              type="text"
              value={editableName}
              onChange={(e) => setEditableName(e.target.value)}
              className="w-full p-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-600 text-sm font-semibold mb-1">이메일</label>
            <input
              id="email"
              type="email"
              value={editableEmail}
              onChange={(e) => setEditableEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-gray-600 text-sm font-semibold mb-1">전화번호</label>
            <input
              id="phoneNumber"
              type="text"
              value={editablePhoneNumber}
              onChange={(e) => setEditablePhoneNumber(e.target.value)}
              className="w-full p-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? '저장 중...' : '정보 저장'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-white rounded-md hover:bg-gray-400 transition duration-200"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};