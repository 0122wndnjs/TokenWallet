// TokenWallet/client/src/pages/dashboard/DashboardPage.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCurrentUser } from '../../api/auth';
import { ethers } from 'ethers'; 

// SendTokenForm 임포트 유지
import SendTokenForm from '../../components/wallet/SendTokenForm'; 
// Modal 컴포넌트 임포트 유지
import Modal from '../../components/common/Modal'; 
// ✨ ReceiveTokenModal 임포트 추가
import ReceiveTokenModal from '../../components/wallet/ReceiveTokenModal';

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
  ethPriceUsd: number; 
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<ExtendedUserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false); 
  // ✨ 수신 모달 상태 추가
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);

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
    }, 30000); 

    return () => clearInterval(intervalId); 
  }, [loadUserData]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  const handleTransactionSuccess = useCallback(() => {
    loadUserData(); 
    setIsSendModalOpen(false); 
  }, [loadUserData]); 

  // 모달 열기/닫기 핸들러 (송금)
  const openSendModal = () => setIsSendModalOpen(true);
  const closeSendModal = () => setIsSendModalOpen(false);

  // ✨ 모달 열기/닫기 핸들러 (수신)
  const openReceiveModal = () => setIsReceiveModalOpen(true);
  const closeReceiveModal = () => setIsReceiveModalOpen(false);


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

  const ethValue = parseFloat(formattedEthBalance) * currentUser.ethPriceUsd; 
  console.log(currentUser.ethPriceUsd, "ETH Price in USD"); 
  const jkValue = rawCustomTokenBalance * 0; 
  const totalAssetValue = (ethValue + jkValue).toFixed(4);


  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
      <h1 className="text-5xl font-bold mb-12">지갑 대시보드</h1>

      {/* 사용자 정보 섹션 (변경 없음) */}
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

      {/* 자산 현황 섹션 (변경 없음) */}
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

      {/* 주요 기능 버튼 섹션 - 송금/수신 버튼 클릭 시 모달 열기 */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl mb-8">
        <h2 className="text-3xl font-semibold mb-6">지갑 기능</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 송금 버튼 */}
          <button 
            className="flex flex-col items-center justify-center p-6 bg-indigo-700 rounded-lg shadow-md hover:bg-indigo-800 transition-colors duration-200"
            onClick={openSendModal} 
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span className="text-xl font-semibold">송금</span> 
          </button>
          
          {/* ✨ 수신 버튼 클릭 시 모달 열기 */}
          <button 
            className="flex flex-col items-center justify-center p-6 bg-green-700 rounded-lg shadow-md hover:bg-green-800 transition-colors duration-200"
            onClick={openReceiveModal} // 수신 모달 열기 함수 연결
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 3h12a2 2 0 012 2v4m-4-11v11.75m0 0a1.75 1.75 0 01-3.5 0V13.75m0 0a1.75 1.75 0 00-3.5 0V4" />
            </svg>
            <span className="text-xl font-semibold">수신</span> {/* "준비 중" 문구 제거 */}
          </button>
          
          <button className="flex flex-col items-center justify-center p-6 bg-purple-700 rounded-lg shadow-md hover:bg-purple-800 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <span className="text-xl font-semibold">교환 (준비 중)</span>
          </button>
        </div>
      </div>

      {/* 💡 임시로 거래 내역 섹션 제거 (변경 없음) */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-3xl font-semibold mb-6">최근 거래 내역</h2>
        <p className="text-gray-400 text-center">거래 내역은 현재 준비 중입니다.</p>
      </div>

      {/* 로그아웃 버튼 (변경 없음) */}
      <button
        onClick={handleLogout}
        className="mt-8 px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700 text-white font-semibold shadow-md transition-colors duration-200"
      >
        로그아웃
      </button>

      {/* 송금 모달 렌더링 (변경 없음) */}
      {currentUser.walletAddress && (
        <Modal isOpen={isSendModalOpen} onClose={closeSendModal}>
          <SendTokenForm 
            onTransactionSuccess={handleTransactionSuccess} 
            userWalletAddress={currentUser.walletAddress} 
          />
        </Modal>
      )}

      {/* ✨ 수신 모달 렌더링 */}
      {currentUser.walletAddress && (
        <Modal isOpen={isReceiveModalOpen} onClose={closeReceiveModal}>
          <ReceiveTokenModal 
            userWalletAddress={currentUser.walletAddress} 
          />
        </Modal>
      )}
    </div>
  );
};

export default DashboardPage;