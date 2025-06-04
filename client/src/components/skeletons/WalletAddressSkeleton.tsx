import React from 'react';

const WalletAddressSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-xl animate-pulse">
      <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div> {/* Title skeleton */}
      <div className="bg-gray-700 p-4 rounded-md flex justify-between items-center">
        <div className="h-6 bg-gray-600 rounded w-2/3"></div> {/* Address skeleton */}
        <div className="h-10 w-20 bg-indigo-700 rounded ml-4"></div> {/* Button skeleton */}
      </div>
    </div>
  );
};

export default WalletAddressSkeleton;