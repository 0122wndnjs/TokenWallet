// TokenWallet/client/src/pages/dashboard/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCurrentUser } from '../../api/auth';
import { UserInfo } from '../../types/auth'; // User 대신 UserInfo 임포트

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null); // User 대신 UserInfo
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const user = await fetchCurrentUser(); // 백엔드에서 실제 사용자 정보 가져오기
        setCurrentUser(user);
      } catch (err: any) {
        console.error("Failed to fetch user data:", err);
        setError(err.response?.data?.message || "사용자 정보를 불러오는데 실패했습니다.");
        // 사용자 정보 로딩 실패 시 로그인 페이지로 리다이렉트
        localStorage.removeItem('accessToken'); // 유효하지 않은 토큰 제거
        navigate('/login'); 
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>사용자 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-900 text-white p-4">
        <p className="text-xl mb-4">에러: {error}</p>
        <button onClick={() => navigate('/login')} className="px-6 py-3 bg-blue-500 rounded hover:bg-blue-600 text-white font-semibold shadow-md">
          로그인 페이지로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
      <h1 className="text-5xl font-bold mb-12">지갑 대시보드</h1>
      
      {currentUser && (
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl mb-8">
          <h2 className="text-3xl font-semibold mb-4">환영합니다, {currentUser.name}!</h2>
          <p className="text-xl text-gray-400">아이디: {currentUser.username}</p>
          <p className="text-xl text-gray-400">이메일: {currentUser.email}</p>
          {currentUser.phoneNumber && <p className="text-xl text-gray-400">전화번호: {currentUser.phoneNumber}</p>}
          
          <div className="mt-6">
            <h3 className="text-2xl font-medium mb-2">나의 지갑 주소:</h3>
            <div className="bg-gray-700 p-4 rounded-md flex justify-between items-center break-words">
              {/* 실제 지갑 주소는 여기에 표시되어야 합니다. 백엔드에서 가져와야 합니다. */}
              <span className="font-mono text-lg text-green-400 select-all">
                0xAbc123...Def456  {/* 임시 주소, 실제 백엔드 데이터로 대체 필요 */}
              </span>
              <button 
                onClick={() => navigator.clipboard.writeText('0xAbc123...Def456')} 
                className="ml-4 px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 text-white font-semibold"
              >
                복사
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 자산 현황 섹션 */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl mb-8">
        <h2 className="text-3xl font-semibold mb-6">자산 현황</h2>
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
          <span className="text-xl font-medium">총 자산 가치:</span>
          <span className="text-2xl font-bold text-green-400">$0.00</span> {/* 실제 값으로 대체 */}
        </div>
        <div>
          <h3 className="text-2xl font-medium mb-4">보유 코인:</h3>
          {/* 예시 코인, 실제 API 데이터로 대체 */}
          <div className="flex justify-between items-center p-3 mb-2 bg-gray-700 rounded-md">
            <span className="text-lg">Bitcoin (BTC)</span>
            <span className="text-lg font-bold">0.00 BTC</span>
          </div>
          <div className="flex justify-between items-center p-3 mb-2 bg-gray-700 rounded-md">
            <span className="text-lg">Ethereum (ETH)</span>
            <span className="text-lg font-bold">0.00 ETH</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-700 rounded-md">
            <span className="text-lg">Token (TW)</span>
            <span className="text-lg font-bold">0.00 TW</span>
          </div>
        </div>
      </div>

      {/* 주요 기능 버튼 섹션 */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl mb-8">
        <h2 className="text-3xl font-semibold mb-6">지갑 기능</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="flex flex-col items-center justify-center p-6 bg-indigo-700 rounded-lg shadow-md hover:bg-indigo-800 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span className="text-xl font-semibold">송금</span>
          </button>
          <button className="flex flex-col items-center justify-center p-6 bg-green-700 rounded-lg shadow-md hover:bg-green-800 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 3h12a2 2 0 012 2v4m-4-11v11.75m0 0a1.75 1.75 0 01-3.5 0V13.75m0 0a1.75 1.75 0 00-3.5 0V4" />
            </svg>
            <span className="text-xl font-semibold">수신</span>
          </button>
          <button className="flex flex-col items-center justify-center p-6 bg-purple-700 rounded-lg shadow-md hover:bg-purple-800 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <span className="text-xl font-semibold">교환</span>
          </button>
        </div>
      </div>

      {/* 거래 내역 섹션 */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-3xl font-semibold mb-6">최근 거래 내역</h2>
        <p className="text-gray-400 text-center">최근 거래 내역이 없습니다.</p>
      </div>

      {/* 로그아웃 버튼 추가 */}
      <button 
        onClick={() => {
          localStorage.removeItem('accessToken');
          navigate('/login');
        }} 
        className="mt-8 px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700 text-white font-semibold shadow-md transition-colors duration-200"
      >
        로그아웃
      </button>
    </div>
  );
};

export default DashboardPage;