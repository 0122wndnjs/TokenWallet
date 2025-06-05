// TokenWallet/client/src/hooks/useDashboardData.ts
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../api/auth";
import { fetchTransactions, Transaction } from "../api/wallet";
import { toast } from "react-toastify";
import { UserInfo } from "../types";

interface DashboardData {
  currentUser: UserInfo | null;
  loading: boolean;
  error: string | null;
  transactions: Transaction[];
  transactionsLoading: boolean;
  transactionsError: string | null;
  loadUserData: () => Promise<void>;
  handleCopyAddress: (address: string) => void;
  ethValue: number;
  jkValue: number;
  totalAssetValue: string;
  formattedEthBalance: string;
  formattedCustomTokenBalance: string;
}

export const useDashboardData = (): DashboardData => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(
    null
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

  const loadTransactions = useCallback(
    async (address: string) => {
      if (!address) return;

      setTransactionsLoading(true);
      setTransactionsError(null);
      try {
        const fetchedTransactions = await fetchTransactions();
        // Sorting here ensures consistent order, even if backend changes
        fetchedTransactions.sort((a, b) => b.timestamp - a.timestamp);
        setTransactions(fetchedTransactions);
      } catch (err: any) {
        console.error("Failed to fetch transactions:", err);
        setTransactionsError(
          err.message || "거래 내역을 불러오는데 실패했습니다."
        );
      } finally {
        setTransactionsLoading(false);
      }
    },
    [] // No dependencies means this function won't change unless its definition does
  );

  const loadUserData = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userAndWalletData: UserInfo = await fetchCurrentUser();
      setCurrentUser(userAndWalletData);
      if (userAndWalletData.walletAddress) {
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
      setLoading(false);
    }
  }, [navigate, loadTransactions]); // loadTransactions is a dependency

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const formattedEthBalance = parseFloat(currentUser?.ethBalance || "0").toFixed(
    4
  );
  const formattedCustomTokenBalance = parseFloat(
    currentUser?.customTokenBalance || "0"
  ).toLocaleString();

  // Calculations for asset values
  const ethValue =
    parseFloat(formattedEthBalance) * (currentUser?.ethPriceUsd || 0);
  const jkValue = parseFloat(formattedCustomTokenBalance.replace(/,/g, "")) * 0; // Placeholder for JK token USD value
  const totalAssetValue = (ethValue + jkValue).toFixed(4);

  return {
    currentUser,
    loading,
    error,
    transactions,
    transactionsLoading,
    transactionsError,
    loadUserData,
    handleCopyAddress,
    ethValue,
    jkValue,
    totalAssetValue,
    formattedEthBalance,
    formattedCustomTokenBalance,
  };
};