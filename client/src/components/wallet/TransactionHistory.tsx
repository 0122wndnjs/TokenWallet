// TokenWallet/client/src/components/dashboard/TransactionHistory.tsx
import React from "react";
import { Transaction } from "../../types";

interface TransactionHistoryProps {
  transactions: Transaction[];
  transactionsLoading: boolean;
  transactionsError: string | null;
  filterToken: "all" | "ETH" | "JK";
  setFilterToken: (token: "all" | "ETH" | "JK") => void;
  currentPage: number;
  totalPages: number;
  paginate: (pageNumber: number) => void;
  transactionsPerPage: number; // Added for clarity in pagination logic
  currentUserWalletAddress: string; // To filter transactions by direction based on current user's address
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  transactionsLoading,
  transactionsError,
  filterToken,
  setFilterToken,
  currentPage,
  totalPages,
  paginate,
  transactionsPerPage,
  currentUserWalletAddress,
}) => {
  const filteredTransactions = transactions.filter((tx) => {
    if (filterToken === "all") {
      return true;
    } else {
      return tx.tokenSymbol.toUpperCase() === filterToken.toUpperCase();
    }
  });

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full lg:w-1/2">
      <h2 className="text-3xl font-semibold mb-6">최근 거래 내역</h2>

      <div className="flex justify-start space-x-4 mb-6">
        <button
          onClick={() => {
            setFilterToken("all");
            paginate(1); // Reset to first page on filter change
          }}
          className={`px-5 py-2 rounded-lg font-semibold transition-colors duration-200 ${
            filterToken === "all"
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          전체 토큰
        </button>
        <button
          onClick={() => {
            setFilterToken("ETH");
            paginate(1);
          }}
          className={`px-5 py-2 rounded-lg font-semibold transition-colors duration-200 ${
            filterToken === "ETH"
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          ETH
        </button>
        <button
          onClick={() => {
            setFilterToken("JK");
            paginate(1);
          }}
          className={`px-5 py-2 rounded-lg font-semibold transition-colors duration-200 ${
            filterToken === "JK"
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          JK
        </button>
      </div>

      {transactionsLoading ? (
        <p className="text-gray-400 text-center">거래 내역을 불러오는 중...</p>
      ) : transactionsError ? (
        <p className="text-red-400 text-center">오류: {transactionsError}</p>
      ) : filteredTransactions.length === 0 ? (
        <p className="text-gray-400 text-center">
          {filterToken === "all"
            ? "아직 거래 내역이 없습니다."
            : `${filterToken} 토큰 거래 내역이 없습니다.`}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-700 rounded-lg">
            <thead>
              <tr className="bg-gray-600 text-gray-300 uppercase text-sm leading-normal whitespace-nowrap">
                <th className="py-3 px-4 text-left">방향</th>
                <th className="py-3 px-4 text-left">수량</th>
                <th className="py-3 px-4 text-left">토큰</th>
                <th className="py-3 px-4 text-left">상대방</th>
                <th className="py-3 px-4 text-left">시간</th>
                <th className="py-3 px-4 text-left">Tx Hash</th>
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
                    {tx.direction === "sent" ? "OUT" : "IN"}
                  </td>
                  <td className="py-3 px-4 text-left">{tx.value}</td>
                  <td className="py-3 px-4 text-left">{tx.tokenSymbol}</td>
                  <td className="py-3 px-4 text-left truncate max-w-[100px]">
                    {tx.direction === "sent" ? tx.to : tx.from}
                  </td>
                  <td className="py-3 px-4 text-left">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-left truncate max-w-[100px]">
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
  );
};

export default TransactionHistory;
