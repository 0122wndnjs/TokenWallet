// TokenWallet/client/src/components/dashboard/DashboardNavigation.tsx
import React from "react";

interface DashboardNavigationProps {
  onSendClick: () => void;
  onReceiveClick: () => void;
  // onExchangeClick: () => void; // If you plan to implement this later
}

const DashboardNavigation: React.FC<DashboardNavigationProps> = ({
  onSendClick,
  onReceiveClick,
  // onExchangeClick,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-gray-800 p-4 shadow-xl z-20">
      <div className="flex justify-around items-center max-w-2xl mx-auto">
        <button
          className="flex flex-col items-center justify-center p-3 bg-indigo-700 rounded-lg shadow-md hover:bg-indigo-800 transition-colors duration-200"
          onClick={onSendClick}
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
          onClick={onReceiveClick}
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
  );
};

export default DashboardNavigation;