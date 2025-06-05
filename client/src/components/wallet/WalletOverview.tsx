// TokenWallet/client/src/components/dashboard/WalletOverview.tsx
import React from "react";

interface WalletOverviewProps {
  walletAddress: string;
  formattedEthBalance: string;
  formattedCustomTokenBalance: string;
  totalAssetValue: string;
  handleCopyAddress: (address: string) => void;
}

const WalletOverview: React.FC<WalletOverviewProps> = ({
  walletAddress,
  formattedEthBalance,
  formattedCustomTokenBalance,
  totalAssetValue,
  handleCopyAddress,
}) => {
  return (
    <div className="w-full lg:w-1/2 flex flex-col space-y-8 mb-8 lg:mb-0">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl">
        <h3 className="text-2xl font-semibold mb-2">지갑 주소:</h3>
        <div className="bg-gray-700 p-4 rounded-md flex justify-between items-center break-words">
          <span className="font-mono text-lg text-green-400 select-all break-all">
            {walletAddress || "지갑 주소 로딩 중..."}
          </span>
          {walletAddress && (
            <button
              onClick={() => handleCopyAddress(walletAddress)}
              className="ml-4 px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 text-white font-semibold flex-shrink-0"
            >
              복사
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-800 p-8 rounded-lg shadow-xl">
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
    </div>
  );
};

export default WalletOverview;