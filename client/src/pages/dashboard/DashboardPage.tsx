// TokenWallet/client/src/pages/DashboardPage.tsx
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SendTokenForm from "../../components/wallet/SendTokenForm";
import Modal from "../../components/common/Modal";
import ReceiveTokenModal from "../../components/wallet/ReceiveTokenModal";
import { toast } from "react-toastify";

// Imported hooks and components
import { useDashboardData } from "../../hooks/useDashboardData";
import DashboardHeader from "../../components/wallet/DashboardHeader";
import WalletOverview from "../../components/wallet/WalletOverview";
import TransactionHistory from "../../components/wallet/TransactionHistory";
import DashboardNavigation from "../../components/wallet/DashboardNavigation";
import ProfileModalContent from "../../components/wallet/ProfileModalContent";

// Skeleton components (still used here for initial loading)
import WalletAddressSkeleton from "../../components/skeletons/WalletAddressSkeleton";
import AssetStatusSkeleton from "../../components/skeletons/AssetStatusSkeleton";
import TransactionListSkeleton from "../../components/skeletons/TransactionListSkeleton";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Use the custom hook to manage dashboard data and state
  const {
    currentUser,
    loading,
    error,
    transactions,
    transactionsLoading,
    transactionsError,
    loadUserData,
    handleCopyAddress,
    totalAssetValue,
    formattedEthBalance,
    formattedCustomTokenBalance,
  } = useDashboardData();

  // State for modal visibility
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // State for transaction filtering and pagination
  const [filterToken, setFilterToken] = useState<"all" | "ETH" | "JK">(
    "all"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(5); // Fixed transactions per page

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  const handleTransactionSuccess = useCallback(() => {
    loadUserData(); // Reload all data after a successful transaction
    setIsSendModalOpen(false);
  }, [loadUserData]);

  const openSendModal = () => setIsSendModalOpen(true);
  const closeSendModal = () => setIsSendModalOpen(false);

  const openReceiveModal = () => setIsReceiveModalOpen(true);
  const closeReceiveModal = () => setIsReceiveModalOpen(false);

  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  // Calculate total pages for pagination based on filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (filterToken === "all") {
      return true;
    } else {
      return tx.tokenSymbol.toUpperCase() === filterToken.toUpperCase();
    }
  });
  const totalPages = Math.ceil(
    filteredTransactions.length / transactionsPerPage
  );
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // --- Render Logic ---

  // Loading state with skeleton UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
        <div className="w-full max-w-7xl flex justify-between items-center mb-8 px-4">
          <div className="h-10 bg-gray-700 rounded w-1/4"></div>
          <div className="flex space-x-4">
            <div className="h-10 w-24 bg-gray-700 rounded-lg"></div>
            <div className="h-10 w-24 bg-gray-700 rounded-lg"></div>
          </div>
        </div>

        <div className="w-full max-w-7xl flex flex-col lg:flex-row lg:space-x-8 mb-8">
          <div className="w-full lg:w-1/2 flex flex-col space-y-8 mb-8 lg:mb-0">
            <WalletAddressSkeleton />
            <AssetStatusSkeleton />
          </div>
          <div className="w-full lg:w-1/2">
            <TransactionListSkeleton />
          </div>
        </div>

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

  // Error state UI
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

  // No user data (should ideally be caught by error, but as a safeguard)
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

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
      {/* 1. Header Section */}
      <DashboardHeader onProfileClick={openProfileModal} onLogout={handleLogout} />

      {/* 2. Main Content Section (2-column layout on PC, 1-column on mobile/tablet) */}
      <div className="w-full max-w-7xl flex flex-col lg:flex-row lg:space-x-8 mb-8">
        {/* Left Section: Wallet Address & Asset Status */}
        <WalletOverview
          walletAddress={currentUser.walletAddress}
          formattedEthBalance={formattedEthBalance}
          formattedCustomTokenBalance={formattedCustomTokenBalance}
          totalAssetValue={totalAssetValue}
          handleCopyAddress={handleCopyAddress}
        />

        {/* Right Section: Recent Transaction History */}
        <TransactionHistory
          transactions={transactions}
          transactionsLoading={transactionsLoading}
          transactionsError={transactionsError}
          filterToken={filterToken}
          setFilterToken={setFilterToken}
          currentPage={currentPage}
          totalPages={totalPages}
          paginate={paginate}
          transactionsPerPage={transactionsPerPage}
          currentUserWalletAddress={currentUser.walletAddress}
        />
      </div>

      {/* 3. Bottom Navigation Section (fixed at the bottom) */}
      <DashboardNavigation
        onSendClick={openSendModal}
        onReceiveClick={openReceiveModal}
      />

      {/* Modals */}
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

          {/* Profile Modal */}
          <Modal isOpen={isProfileModalOpen} onClose={closeProfileModal}>
            <ProfileModalContent
              currentUser={currentUser}
              onClose={closeProfileModal}
            />
          </Modal>
        </>
      )}
    </div>
  );
};

export default DashboardPage;