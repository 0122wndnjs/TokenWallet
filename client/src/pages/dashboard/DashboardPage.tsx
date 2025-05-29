// TokenWallet/client/src/pages/dashboard/DashboardPage.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCurrentUser } from '../../api/auth';
import { fetchWalletBalances } from '../../api/walletApi';
import { UserInfo, WalletBalances } from '../../types/auth';
import { ethers } from 'ethers';

// import SendTokenForm from '../../components/Wallet/SendTokenForm';
// import TransactionHistory from '../../components/Wallet/TransactionHistory';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [walletBalances, setWalletBalances] = useState<WalletBalances | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleCopyAddress = useCallback((address: string) => {
    navigator.clipboard.writeText(address);
    alert('지갑 주소가 클립보드에 복사되었습니다!');
  }, []);

  const loadUserDataAndWallet = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const user = await fetchCurrentUser();
      setCurrentUser(user);

      const balances = await fetchWalletBalances();
      setWalletBalances(balances);

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
    loadUserDataAndWallet();
  }, [loadUserDataAndWallet]);

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

  // 💡 지갑 주소를 짧게 표시하는 헬퍼 함수는 이제 필요 없으므로 제거하거나 주석 처리합니다.
  // const shortenAddress = (address: string | undefined) => {
  //   if (!address) return 'N/A';
  //   return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  // };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
      <h1 className="text-5xl font-bold mb-12">지갑 대시보드</h1>

      {/* 사용자 정보 섹션 */}
      {currentUser && (
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl mb-8">
          <h2 className="text-3xl font-semibold mb-4">환영합니다, {currentUser.name}!</h2>
          <p className="text-xl text-gray-400">아이디: {currentUser.username}</p>
          <p className="text-xl text-gray-400">이메일: {currentUser.email}</p>
          {currentUser.phoneNumber && <p className="text-xl text-gray-400">전화번호: {currentUser.phoneNumber}</p>}

          <div className="mt-6">
            <h3 className="text-2xl font-medium mb-2">나의 지갑 주소:</h3>
            <div className="bg-gray-700 p-4 rounded-md flex justify-between items-center break-words">
              {/* 💡 shortenAddress 함수 호출 대신, 전체 walletBalances.walletAddress를 직접 표시합니다. */}
              <span className="font-mono text-lg text-green-400 select-all">
                {walletBalances?.walletAddress || '지갑 주소 로딩 중...'}
              </span>
              {walletBalances?.walletAddress && (
                <button
                  onClick={() => handleCopyAddress(walletBalances.walletAddress)}
                  className="ml-4 px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 text-white font-semibold"
                >
                  복사
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 자산 현황 섹션 */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl mb-8">
        <h2 className="text-3xl font-semibold mb-6">자산 현황</h2>
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
          <span className="text-xl font-medium">총 자산 가치:</span>
          <span className="text-2xl font-bold text-green-400">
            {walletBalances ? `$${(parseFloat(ethers.formatEther(walletBalances.ethBalance || '0')) * 2000 + parseFloat(walletBalances.customTokenBalance || '0') * 1).toFixed(2)}` : '$0.00'}
            {/* ETH 1개당 $2000, 커스텀 토큰 1개당 $1 가정 (실제 시세 연동 필요) */}
          </span>
        </div>
        <div>
          <h3 className="text-2xl font-medium mb-4">보유 코인:</h3>
          <div className="flex justify-between items-center p-3 mb-2 bg-gray-700 rounded-md">
            <span className="text-lg">Ethereum (ETH)</span>
            <span className="text-lg font-bold">
              {walletBalances ? `${parseFloat(ethers.formatEther(walletBalances.ethBalance || '0')).toFixed(4)} ETH` : '0.0000 ETH'}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-700 rounded-md">
            <span className="text-lg">Token (TW)</span>
            <span className="text-lg font-bold">
              {walletBalances ? `${parseFloat(walletBalances.customTokenBalance || '0').toFixed(2)} TW` : '0.00 TW'}
            </span>
          </div>
        </div>
      </div>

      {/* 💡 임시로 송금 섹션 제거 */}
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