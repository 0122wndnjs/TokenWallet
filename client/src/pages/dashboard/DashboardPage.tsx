// TokenWallet/client/src/pages/DashboardPage.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../../api/auth";
import SendTokenForm from "../../components/wallet/SendTokenForm";
import Modal from "../../components/common/Modal";
import ReceiveTokenModal from "../../components/wallet/ReceiveTokenModal";
import { fetchTransactions, Transaction } from "../../api/wallet";
import { toast } from "react-toastify";

// 스켈레톤 컴포넌트 import
import WalletAddressSkeleton from "../../components/skeletons/WalletAddressSkeleton";
import AssetStatusSkeleton from "../../components/skeletons/AssetStatusSkeleton";
import TransactionListSkeleton from "../../components/skeletons/TransactionListSkeleton";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false); // 거래 내역 로딩 상태 분리
  const [transactionsError, setTransactionsError] = useState<string | null>(
    null
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(5);
  const [filterType, setFilterType] = useState<"all" | "sent" | "received">(
    "all"
  );

  const handleCopyAddress = useCallback((address: string) => {
    navigator.clipboard
      .writeText(address)
      .then(() => {
        toast.success("지갑 주소가 클립보드에 복사되었습니다!");
      })
      .catch((err) => {
        console.error("클립보드 복사 실패:", err);
        toast.error("지갑 주소 복사에 실패했습니다.");
      });
  }, []);

  const loadTransactions = useCallback(async (address: string) => {
    if (!address) return;

    setTransactionsLoading(true); // 거래 내역 로딩 시작
    setTransactionsError(null);
    try {
      const fetchedTransactions = await fetchTransactions();
      fetchedTransactions.sort((a, b) => b.timestamp - a.timestamp); // 이미 백엔드에서 정렬되지만, 혹시 몰라 다시 정렬

      setTransactions(fetchedTransactions);
    } catch (err: any) {
      console.error("Failed to fetch transactions:", err);
      setTransactionsError(
        err.message || "거래 내역을 불러오는데 실패했습니다."
      );
    } finally {
      setTransactionsLoading(false); // 거래 내역 로딩 종료
    }
  }, []);

  const loadUserData = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true); // 전체 대시보드 로딩 시작
    setError(null);

    try {
      const userAndWalletData: ExtendedUserInfo = await fetchCurrentUser();
      setCurrentUser(userAndWalletData);
      if (userAndWalletData.walletAddress) {
        // 사용자 데이터 로드 완료 후 거래 내역 로드
        await loadTransactions(userAndWalletData.walletAddress);
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
      setLoading(false); // 전체 대시보드 로딩 종료
    }
  }, [navigate, loadTransactions]); // loadTransactions 의존성 추가

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  const handleTransactionSuccess = useCallback(() => {
    loadUserData(); // 송금 성공 시 사용자 데이터 및 거래 내역 갱신
    setIsSendModalOpen(false);
  }, [loadUserData]);

  const openSendModal = () => setIsSendModalOpen(true);
  const closeSendModal = () => setIsSendModalOpen(false);

  const openReceiveModal = () => setIsReceiveModalOpen(true);
  const closeReceiveModal = () => setIsReceiveModalOpen(false);

  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  // 로딩 중일 때는 스켈레톤 UI를 렌더링
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
        {/* 헤더 섹션 스켈레톤 */}
        <div className="w-full max-w-7xl flex justify-between items-center mb-8 px-4">
          <div className="h-10 bg-gray-700 rounded w-1/4"></div>
          <div className="flex space-x-4">
            <div className="h-10 w-24 bg-gray-700 rounded-lg"></div>
            <div className="h-10 w-24 bg-gray-700 rounded-lg"></div>
          </div>
        </div>

        {/* 메인 콘텐츠 스켈레톤 */}
        <div className="w-full max-w-7xl flex flex-col lg:flex-row lg:space-x-8 mb-8">
          <div className="w-full lg:w-1/2 flex flex-col space-y-8 mb-8 lg:mb-0">
            <WalletAddressSkeleton />
            <AssetStatusSkeleton />
          </div>
          <div className="w-full lg:w-1/2">
            <TransactionListSkeleton />
          </div>
        </div>

        {/* 하단 네비게이션 스켈레톤 */}
        <nav className="fixed bottom-0 left-0 w-full bg-gray-800 p-4 shadow-xl z-20">
          <div className="flex justify-around items-center max-w-2xl mx-auto">
            <div className="h-16 w-24 bg-gray-700 rounded-lg"></div>
            <div className="h-16 w-24 bg-gray-700 rounded-lg"></div>
            <div className="h-16 w-24 bg-gray-700 rounded-lg"></div>
          </div>
        </nav>
      </div>
    );
  }

  // 에러 발생 시 UI
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
  const jkValue = parseFloat(formattedCustomTokenBalance.replace(/,/g, "")) * 0; // JK 토큰의 USD 가치, 실제 값으로 업데이트 필요
  const totalAssetValue = (ethValue + jkValue).toFixed(4);

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === "sent") {
      return tx.direction === "sent";
    }
    if (filterType === "received") {
      return tx.direction === "received";
    }
    return true;
  });

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  const totalPages = Math.ceil(
    filteredTransactions.length / transactionsPerPage
  );
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
      {/* 1. 헤더 섹션 (전체 화면 너비 사용) */}
      <div className="w-full max-w-7xl flex justify-between items-center mb-8 px-4">
        <h1 className="text-4xl font-bold text-white whitespace-nowrap">
          MY WALLET
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={openProfileModal}
            className="px-5 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 text-white font-semibold shadow-md transition-colors duration-200"
          >
            Profile
          </button>
          <button
            onClick={handleLogout}
            className="px-5 py-2 bg-red-600 rounded-lg hover:bg-red-700 text-white font-semibold shadow-md transition-colors duration-200"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 2. 메인 콘텐츠 섹션 - PC에서는 2단 레이아웃, 모바일/태블릿에서는 1단 */}
      <div className="w-full max-w-7xl flex flex-col lg:flex-row lg:space-x-8 mb-8">
        {/* 왼쪽 섹션: 나의 지갑 주소 & 자산 현황 */}
        <div className="w-full lg:w-1/2 flex flex-col space-y-8 mb-8 lg:mb-0">
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl">
            <h3 className="text-2xl font-medium mb-2">나의 지갑 주소:</h3>
            <div className="bg-gray-700 p-4 rounded-md flex justify-between items-center break-words">
              <span className="font-mono text-lg text-green-400 select-all break-all">
                {currentUser.walletAddress || "지갑 주소 로딩 중..."}
              </span>
              {currentUser.walletAddress && (
                <button
                  onClick={() => handleCopyAddress(currentUser.walletAddress)}
                  className="ml-4 px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 text-white font-semibold flex-shrink-0"
                >
                  복사
                </button>
              )}
            </div>
          </div>

          <div className="bg-gray-800 p-8 rounded-lg shadow-xl">
            <h2 className="text-3xl font-semibold mb-6">자산 현황</h2>
            {/* 자산 현황 섹션의 로딩 상태는 전체 로딩으로 대체 */}
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
        </div>

        {/* 오른쪽 섹션: 최근 거래 내역 */}
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full lg:w-1/2">
          <h2 className="text-3xl font-semibold mb-6">최근 거래 내역</h2>

          <div className="flex justify-start space-x-4 mb-6">
            <button
              onClick={() => {
                setFilterType("all");
                setCurrentPage(1);
              }}
              className={`px-5 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                filterType === "all"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              전체
            </button>
            <button
              onClick={() => {
                setFilterType("sent");
                setCurrentPage(1);
              }}
              className={`px-5 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                filterType === "sent"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              보냄
            </button>
            <button
              onClick={() => {
                setFilterType("received");
                setCurrentPage(1);
              }}
              className={`px-5 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                filterType === "received"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              받음
            </button>
          </div>

          {transactionsLoading ? ( // 거래 내역만 따로 로딩 중일 때
            <p className="text-gray-400 text-center">
              거래 내역을 불러오는 중...
            </p>
          ) : transactionsError ? (
            <p className="text-red-400 text-center">
              오류: {transactionsError}
            </p>
          ) : filteredTransactions.length === 0 ? (
            <p className="text-gray-400 text-center">
              {filterType === "all"
                ? "아직 거래 내역이 없습니다."
                : `표시할 ${
                    filterType === "sent" ? "보낸" : "받은"
                  } 거래 내역이 없습니다.`}
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
                  {currentTransactions.map((tx) => (
                    <tr
                      key={`${tx.hash}-${tx.tokenType}`}
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
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="flex justify-center items-center py-6 space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => paginate(index + 1)}
                      className={`px-4 py-2 rounded-lg font-semibold ${
                        currentPage === index + 1
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. 하단 네비게이션 섹션 (하단 고정, w-full 유지) */}
      <nav className="fixed bottom-0 left-0 w-full bg-gray-800 p-4 shadow-xl z-20">
        <div className="flex justify-around items-center max-w-2xl mx-auto">
          <button
            className="flex flex-col items-center justify-center p-3 bg-indigo-700 rounded-lg shadow-md hover:bg-indigo-800 transition-colors duration-200"
            onClick={openSendModal}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
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
            <span className="text-sm font-semibold mt-1">송금</span>
          </button>

          <button
            className="flex flex-col items-center justify-center p-3 bg-green-700 rounded-lg shadow-md hover:bg-green-800 transition-colors duration-200"
            onClick={openReceiveModal}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
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
            <span className="text-sm font-semibold mt-1">수신</span>
          </button>

          <button className="flex flex-col items-center justify-center p-3 bg-purple-700 rounded-lg shadow-md hover:bg-purple-800 transition-colors duration-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
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
            <span className="text-sm font-semibold mt-1">교환</span>
          </button>
        </div>
      </nav>

      {/* 모달 렌더링 */}
      {currentUser.walletAddress && (
        <>
          <Modal isOpen={isSendModalOpen} onClose={closeSendModal}>
            <SendTokenForm
              onTransactionSuccess={handleTransactionSuccess}
              userWalletAddress={currentUser.walletAddress}
            />
          </Modal>

          <Modal isOpen={isReceiveModalOpen} onClose={closeReceiveModal}>
            <ReceiveTokenModal userWalletAddress={currentUser.walletAddress} />
          </Modal>

          {/* Profile 모달 */}
          <Modal isOpen={isProfileModalOpen} onClose={closeProfileModal}>
            <div className="p-8 bg-gray-700 rounded-lg text-white max-w-md mx-auto">
              <h2 className="text-3xl font-semibold mb-4 text-center">
                내 프로필
              </h2>
              <div className="space-y-3">
                <p className="text-xl text-gray-300">
                  <span className="font-medium">아이디:</span>{" "}
                  {currentUser.username}
                </p>
                <p className="text-xl text-gray-300">
                  <span className="font-medium">이름:</span> {currentUser.name}
                </p>
                <p className="text-xl text-gray-300">
                  <span className="font-medium">이메일:</span>{" "}
                  {currentUser.email}
                </p>
                {currentUser.phoneNumber && (
                  <p className="text-xl text-gray-300">
                    <span className="font-medium">전화번호:</span>{" "}
                    {currentUser.phoneNumber}
                  </p>
                )}
                {currentUser.createdAt && (
                  <p className="text-lg text-gray-400 pt-4 border-t border-gray-600">
                    계정 생성일:{" "}
                    {new Date(currentUser.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <button
                onClick={closeProfileModal}
                className="mt-6 w-full py-3 bg-red-600 rounded-lg hover:bg-red-700 text-white font-semibold shadow-md transition-colors duration-200"
              >
                닫기
              </button>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
