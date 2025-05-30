// TokenWallet/client/src/pages/dashboard/DashboardPage.tsx

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../../api/auth";
import SendTokenForm from "../../components/wallet/SendTokenForm";
import Modal from "../..///components/common/Modal";
import ReceiveTokenModal from "../../components/wallet/ReceiveTokenModal";
import { fetchTransactions, Transaction } from "../../api/wallet";

interface ExtendedUserInfo {
  id: string;
  username: string;
  name: string;
  email: string;
  phoneNumber?: string;
  walletAddress: string;
  customTokenBalance: string; // 이미 포맷팅된 문자열로 받음
  ethBalance: string; // 이미 포맷팅된 문자열로 받음
  createdAt?: string;
  updatedAt?: string;
  ethPriceUsd: number;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<ExtendedUserInfo | null>(null);
  const [loading, setLoading] = useState(true); // 초기 사용자 정보 로딩 상태
  const [error, setError] = useState<string | null>(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false); // ✨ 초기값 false로 변경
  const [transactionsError, setTransactionsError] = useState<string | null>(
    null
  );

  const handleCopyAddress = useCallback((address: string) => {
    navigator.clipboard.writeText(address);
    alert("지갑 주소가 클립보드에 복사되었습니다!");
  }, []);

  // 사용자 정보 (지갑 주소, 잔액 포함)를 불러오는 함수
  const loadUserData = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true); // 데이터 로드 시작 시 로딩 상태 설정
    setError(null); // 이전 에러 초기화

    try {
      const userAndWalletData: ExtendedUserInfo = await fetchCurrentUser();
      setCurrentUser(userAndWalletData);
      // 사용자 데이터 로드 성공 시 바로 거래 내역도 로드
      if (userAndWalletData.walletAddress) {
        await loadTransactions(userAndWalletData.walletAddress); // ✨ 성공 시 거래 내역도 바로 로드
      }
    } catch (err: any) {
      console.error("Failed to fetch user data or wallet balances:", err);
      setError(
        err.response?.data?.message ||
          "사용자 또는 지갑 정보를 불러오는데 실패했습니다."
      );
      localStorage.removeItem("accessToken");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // 거래 내역 로딩 함수
  const loadTransactions = useCallback(async (address: string) => {
    if (!address) return;

    setTransactionsLoading(true);
    setTransactionsError(null);
    try {
      const fetchedTransactions = await fetchTransactions();
      setTransactions(fetchedTransactions);
    } catch (err: any) {
      console.error("Failed to fetch transactions:", err);
      setTransactionsError(
        err.message || "거래 내역을 불러오는데 실패했습니다."
      );
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  useEffect(() => {
    // ✨ 컴포넌트 마운트 시 최초 1회만 사용자 데이터와 거래 내역 로드
    loadUserData();
  }, [loadUserData]); // loadUserData가 변경될 때마다 재실행 (useCallback 덕분에 안정적)

  // ✨ 주기적인 업데이트 관련 useEffect 블록 전체 제거 ✨
  // (이전 코드에서 currentUser, loadUserData, loadTransactions를 의존성으로 가졌던 useEffect)

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  const handleTransactionSuccess = useCallback(() => {
    loadUserData(); // 사용자 데이터 (잔액) 새로고침
    setIsSendModalOpen(false); // 모달 닫기
    // 송금 성공 후 거래 내역도 새로고침은 loadUserData 내부에서 처리됨
  }, [loadUserData]); // currentUser, loadTransactions 제거

  const openSendModal = () => setIsSendModalOpen(true);
  const closeSendModal = () => setIsSendModalOpen(false);

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
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-3 bg-blue-500 rounded hover:bg-blue-600 text-white font-semibold shadow-md"
        >
          로그인 페이지로 돌아가기
        </button>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
        <p>사용자 정보를 불러올 수 없습니다. 다시 시도해주세요.</p>
        <button
          onClick={loadUserData}
          className="mt-4 px-6 py-3 bg-blue-500 rounded hover:bg-blue-600 text-white font-semibold shadow-md"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const formattedEthBalance = parseFloat(currentUser.ethBalance || "0").toFixed(
    4
  );
  const formattedCustomTokenBalance = parseFloat(
    currentUser.customTokenBalance || "0"
  ).toLocaleString();

  const ethValue =
    parseFloat(formattedEthBalance) * (currentUser.ethPriceUsd || 0);
  const jkValue = parseFloat(formattedCustomTokenBalance.replace(/,/g, "")) * 0;
  const totalAssetValue = (ethValue + jkValue).toFixed(4);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
      <h1 className="text-5xl font-bold mb-12">MY WALLET</h1>
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl mb-8">
        <h2 className="text-3xl font-semibold mb-4">
          환영합니다, {currentUser.name}!
        </h2>
        <p className="text-xl text-gray-400">아이디: {currentUser.username}</p>
        <p className="text-xl text-gray-400">이메일: {currentUser.email}</p>
        {currentUser.phoneNumber && (
          <p className="text-xl text-gray-400">
            전화번호: {currentUser.phoneNumber}
          </p>
        )}

        <div className="mt-6">
          <h3 className="text-2xl font-medium mb-2">나의 지갑 주소:</h3>
          <div className="bg-gray-700 p-4 rounded-md flex justify-between items-center break-words">
            <span className="font-mono text-lg text-green-400 select-all">
              {currentUser.walletAddress || "지갑 주소 로딩 중..."}
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

      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl mb-8">
        <h2 className="text-3xl font-semibold mb-6">자산 현황</h2>
        {/* 잔액 로딩은 이제 loadUserData의 loading 상태가 처리합니다. */}
        {/* 거래 내역 로딩 인디케이터만 남겨둡니다. */}
        {loading && (
          <p className="text-gray-400 text-center mb-4">잔액 업데이트 중...</p>
        )}
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

      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl mb-8">
        <h2 className="text-3xl font-semibold mb-6">지갑 기능</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            className="flex flex-col items-center justify-center p-6 bg-indigo-700 rounded-lg shadow-md hover:bg-indigo-800 transition-colors duration-200"
            onClick={openSendModal}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            <span className="text-xl font-semibold">송금</span>
          </button>

          <button
            className="flex flex-col items-center justify-center p-6 bg-green-700 rounded-lg shadow-md hover:bg-green-800 transition-colors duration-200"
            onClick={openReceiveModal}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 3h12a2 2 0 012 2v4m-4-11v11.75m0 0a1.75 1.75 0 01-3.5 0V13.75m0 0a1.75 1.75 0 00-3.5 0V4"
              />
            </svg>
            <span className="text-xl font-semibold">수신</span>
          </button>

          <button className="flex flex-col items-center justify-center p-6 bg-purple-700 rounded-lg shadow-md hover:bg-purple-800 transition-colors duration-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
            <span className="text-xl font-semibold">교환 (준비 중)</span>
          </button>
        </div>
      </div>

      {/* 거래 내역 */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl mb-8">
        <h2 className="text-3xl font-semibold mb-6">최근 거래 내역</h2>
        {transactionsLoading ? (
          <p className="text-gray-400 text-center">
            거래 내역을 불러오는 중...
          </p>
        ) : transactionsError ? (
          <p className="text-red-400 text-center">오류: {transactionsError}</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-400 text-center">
            아직 거래 내역이 없습니다.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg">
              <thead>
                <tr className="bg-gray-600 text-gray-300 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">방향</th>
                  <th className="py-3 px-6 text-left">수량</th>
                  <th className="py-3 px-6 text-left">토큰</th>
                  <th className="py-3 px-6 text-left">상대방</th>
                  <th className="py-3 px-6 text-left">시간</th>
                  <th className="py-3 px-6 text-left">Tx Hash</th>
                </tr>
              </thead>
              <tbody className="text-gray-200 text-sm font-light">
                {transactions.map((tx) => (
                  <tr
                    key={tx.hash}
                    className="border-b border-gray-600 hover:bg-gray-600"
                  >
                    <td
                      className={`py-3 px-6 text-left font-bold ${
                        tx.direction === "sent"
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      {tx.direction === "sent" ? "보냄" : "받음"}
                    </td>
                    <td className="py-3 px-6 text-left">{tx.value}</td>
                    <td className="py-3 px-6 text-left">{tx.tokenSymbol}</td>
                    <td className="py-3 px-6 text-left truncate max-w-[100px]">
                      {tx.direction === "sent" ? tx.to : tx.from}
                    </td>
                    <td className="py-3 px-6 text-left">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-6 text-left truncate max-w-[100px]">
                      <a
                        href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {tx.hash.substring(0, 6)}...
                        {tx.hash.substring(tx.hash.length - 4)}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 로그아웃 버튼 */}
      <button
        onClick={handleLogout}
        className="mt-8 px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700 text-white font-semibold shadow-md transition-colors duration-200"
      >
        로그아웃
      </button>

      {/* 송금 모달 렌더링 */}
      {currentUser.walletAddress && (
        <Modal isOpen={isSendModalOpen} onClose={closeSendModal}>
          <SendTokenForm
            onTransactionSuccess={handleTransactionSuccess}
            userWalletAddress={currentUser.walletAddress}
          />
        </Modal>
      )}

      {currentUser.walletAddress && (
        <Modal isOpen={isReceiveModalOpen} onClose={closeReceiveModal}>
          <ReceiveTokenModal userWalletAddress={currentUser.walletAddress} />
        </Modal>
      )}
    </div>
  );
};

export default DashboardPage;