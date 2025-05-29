// TokenWallet/client/src/pages/NotFoundPage.tsx
import React from 'react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold text-gray-900">404</h1>
        <p className="mt-4 text-xl text-gray-600">페이지를 찾을 수 없습니다.</p>
        <a href="/login" className="mt-6 inline-block text-indigo-600 hover:text-indigo-500 font-medium">
          로그인 페이지로 돌아가기
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;