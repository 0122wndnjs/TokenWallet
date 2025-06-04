import React from 'react';

const TransactionListSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-xl animate-pulse">
      <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div> {/* Section title skeleton */}

      <div className="flex justify-start space-x-4 mb-6">
        <div className="h-10 w-24 bg-gray-700 rounded-lg"></div> {/* Filter button skeleton */}
        <div className="h-10 w-24 bg-gray-700 rounded-lg"></div> {/* Filter button skeleton */}
        <div className="h-10 w-24 bg-gray-700 rounded-lg"></div> {/* Filter button skeleton */}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-700 rounded-lg">
          <thead>
            <tr className="bg-gray-600 text-gray-300 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left w-[15%]"></th>
              <th className="py-3 px-6 text-left w-[15%]"></th>
              <th className="py-3 px-6 text-left w-[10%]"></th>
              <th className="py-3 px-6 text-left w-[30%]"></th>
              <th className="py-3 px-6 text-left w-[20%]"></th>
              <th className="py-3 px-6 text-left w-[10%]"></th>
            </tr>
          </thead>
          <tbody className="text-gray-200 text-sm font-light">
            {[...Array(5)].map((_, index) => ( // 5개의 스켈레톤 로우
              <tr key={index} className="border-b border-gray-600">
                <td className="py-3 px-6 text-left">
                  <div className="h-5 bg-gray-600 rounded w-3/4"></div>
                </td>
                <td className="py-3 px-6 text-left">
                  <div className="h-5 bg-gray-600 rounded w-1/2"></div>
                </td>
                <td className="py-3 px-6 text-left">
                  <div className="h-5 bg-gray-600 rounded w-1/3"></div>
                </td>
                <td className="py-3 px-6 text-left">
                  <div className="h-5 bg-gray-600 rounded w-full"></div>
                </td>
                <td className="py-3 px-6 text-left">
                  <div className="h-5 bg-gray-600 rounded w-2/3"></div>
                </td>
                <td className="py-3 px-6 text-left">
                  <div className="h-5 bg-blue-600 rounded w-1/2"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionListSkeleton;