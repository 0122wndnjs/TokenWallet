// TokenWallet/client/src/components/dashboard/DashboardHeader.tsx
import React from "react";

interface DashboardHeaderProps {
  onProfileClick: () => void;
  onLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onProfileClick,
  onLogout,
}) => {
  return (
    <div className="w-full max-w-7xl flex justify-between items-center mb-8 px-4">
      <h1 className="text-4xl font-bold text-white whitespace-nowrap">
        MY WALLET
      </h1>
      <div className="flex space-x-4">
        <button
          onClick={onProfileClick}
          className="px-5 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 text-white font-semibold shadow-md transition-colors duration-200"
        >
          Profile
        </button>
        <button
          onClick={onLogout}
          className="px-5 py-2 bg-red-600 rounded-lg hover:bg-red-700 text-white font-semibold shadow-md transition-colors duration-200"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;