// TokenWallet/client/src/pages/dashboard/DashboardPage.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCurrentUser } from '../../api/auth';
import { ethers } from 'ethers'; 
import { current } from '@reduxjs/toolkit';

// ExtendedUserInfo 인터페이스에 ethPriceUsd 추가
interface ExtendedUserInfo {
  id: string;
  username: string;
  name: string;
  email: string;
  phoneNumber?: string;
  walletAddress: string;
  customTokenBalance: string;
  ethBalance: string;
  createdAt?: string;
  updatedAt?: string;
  ethPriceUsd: number; // ✨ 추가: ETH의 현재 USD 가격
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<ExtendedUserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleCopyAddress = useCallback((address: string) => {
    navigator.clipboard.writeText(address);
    alert('지갑 주소가 클립보드에 복사되었습니다!');
  }, []);

  const loadUserData = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // fetchCurrentUser가 ethPriceUsd를 포함하여 반환합니다.
      const userAndWalletData: ExtendedUserInfo = await fetchCurrentUser(); 
      setCurrentUser(userAndWalletData);

    } catch (err: any) {
      console.error("Failed to fetch user data or wallet balances:", err);
      setError(err.response?.data?.message || "사용자 또는 지갑 정보를 불러오는데 실패했습니다.");
      localStorage.removeItem('accessToken');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadUserData();

    const intervalId = setInterval(() => {
    loadUserData(); // 30초마다 업데이트
  }, 30000); // 30초 = 30000 밀리초

  return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 인터벌 해제
  }, [loadUserData]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>사용자 및 지갑 정보를 불러오는 중...</p>
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

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
        <p>사용자 정보를 불러올 수 없습니다. 다시 시도해주세요.</p>
        <button onClick={loadUserData} className="mt-4 px-6 py-3 bg-blue-500 rounded hover:bg-blue-600 text-white font-semibold shadow-md">
          다시 시도
        </button>
      </div>
    );
  }

  const formattedEthBalance = parseFloat(ethers.formatEther(currentUser.ethBalance || '0')).toFixed(4);
  const rawCustomTokenBalance = parseFloat(ethers.formatEther(currentUser.customTokenBalance || '0'));
  const formattedCustomTokenBalance = rawCustomTokenBalance.toLocaleString(); 

  // ✨ ETH 가격에 currentUser.ethPriceUsd 사용
  // JK 토큰은 현재 시장 가격이 없으므로 임시로 1달러로 고정하거나 0으로 처리할 수 있습니다.
  // 여기서는 1달러로 유지합니다.
  const ethValue = parseFloat(formattedEthBalance) * currentUser.ethPriceUsd; 
  console.log(currentUser.ethPriceUsd, "ETH Price in USD"); // 디버깅용 로그
  const jkValue = rawCustomTokenBalance * 0; // JK 토큰은 현재 $0로 고정
  const totalAssetValue = (ethValue + jkValue).toFixed(4);


  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
      <h1 className="text-5xl font-bold mb-12">지갑 대시보드</h1>

      {/* 사용자 정보 섹션 */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl mb-8">
        <h2 className="text-3xl font-semibold mb-4">환영합니다, {currentUser.name}!</h2>
        <p className="text-xl text-gray-400">아이디: {currentUser.username}</p>
        <p className="text-xl text-gray-400">이메일: {currentUser.email}</p>
        {currentUser.phoneNumber && <p className="text-xl text-gray-400">전화번호: {currentUser.phoneNumber}</p>}

        <div className="mt-6">
          <h3 className="text-2xl font-medium mb-2">나의 지갑 주소:</h3>
          <div className="bg-gray-700 p-4 rounded-md flex justify-between items-center break-words">
            <span className="font-mono text-lg text-green-400 select-all">
              {currentUser.walletAddress || '지갑 주소 로딩 중...'}
            </span>
            {currentUser.walletAddress && (
              <button
                onClick={() => handleCopyAddress(currentUser.walletAddress)}
                className="ml-4 px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 text-white font-semibold"
              >
                복사
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 자산 현황 섹션 */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl mb-8">
        <h2 className="text-3xl font-semibold mb-6">자산 현황</h2>
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
          <span className="text-xl font-medium">총 자산 가치:</span>
          <span className="text-2xl font-bold text-green-400">
            {`$${totalAssetValue}`}
          </span>
        </div>
        <div>
          <h3 className="text-2xl font-medium mb-4">보유 코인:</h3>
          <div className="flex justify-between items-center p-3 mb-2 bg-gray-700 rounded-md">
            <span className="text-lg">Ethereum (ETH)</span>
            <span className="text-lg font-bold">
              {`${formattedEthBalance} ETH`}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-700 rounded-md">
            <span className="text-lg">Token (JK)</span>
            <span className="text-lg font-bold">
              {`${formattedCustomTokenBalance} JK`}
            </span>
          </div>
        </div>
      </div>

      {/* 💡 임시로 송금 섹션 제거 (주석 처리된 컴포넌트들) */}
      {/* <SendTokenForm /> */}

      {/* 주요 기능 버튼 섹션 - 송금, 수신, 교환 버튼은 그대로 둡니다. (클릭 시 동작 없음) */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl mb-8">
        <h2 className="text-3xl font-semibold mb-6">지갑 기능</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="flex flex-col items-center justify-center p-6 bg-indigo-700 rounded-lg shadow-md hover:bg-indigo-800 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span className="text-xl font-semibold">송금 (준비 중)</span>
          </button>
          <button className="flex flex-col items-center justify-center p-6 bg-green-700 rounded-lg shadow-md hover:bg-green-800 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 3h12a2 2 0 012 2v4m-4-11v11.75m0 0a1.75 1.75 0 01-3.5 0V13.75m0 0a1.75 1.75 0 00-3.5 0V4" />
            </svg>
            <span className="text-xl font-semibold">수신 (준비 중)</span>
          </button>
          <button className="flex flex-col items-center justify-center p-6 bg-purple-700 rounded-lg shadow-md hover:bg-purple-800 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <span className="text-xl font-semibold">교환 (준비 중)</span>
          </button>
        </div>
      </div>

      {/* 💡 임시로 거래 내역 섹션 제거 */}
      {/* <TransactionHistory /> */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-3xl font-semibold mb-6">최근 거래 내역</h2>
        <p className="text-gray-400 text-center">거래 내역은 현재 준비 중입니다.</p>
      </div>

      {/* 로그아웃 버튼 */}
      <button
        onClick={handleLogout}
        className="mt-8 px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700 text-white font-semibold shadow-md transition-colors duration-200"
      >
        로그아웃
      </button>
    </div>
  );
};

export default DashboardPage;