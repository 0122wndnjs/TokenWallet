import React from 'react';

const AssetStatusSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-xl animate-pulse">
      <div className="h-8 bg-gray-700 rounded w-1/2 mb-6"></div> {/* Section title skeleton */}
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
        <div className="h-6 bg-gray-700 rounded w-1/4"></div> {/* Total asset title skeleton */}
        <div className="h-8 bg-green-700 rounded w-1/3"></div> {/* Total asset value skeleton */}
      </div>
      <div>
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div> {/* Coin list title skeleton */}
        <div className="flex justify-between items-center p-3 mb-2 bg-gray-700 rounded-md">
          <div className="h-5 bg-gray-600 rounded w-1/4"></div> {/* Coin name skeleton */}
          <div className="h-5 bg-gray-600 rounded w-1/4"></div> {/* Coin balance skeleton */}
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-700 rounded-md">
          <div className="h-5 bg-gray-600 rounded w-1/4"></div> {/* Coin name skeleton */}
          <div className="h-5 bg-gray-600 rounded w-1/4"></div> {/* Coin balance skeleton */}
        </div>
      </div>
    </div>
  );
};

export default AssetStatusSkeleton;