// TokenWallet/client/src/components/admin/AdminLayout.tsx
import React, { ReactNode } from 'react';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* 사이드바가 차지할 공간을 예약하고 실제 사이드바 컴포넌트를 렌더링 */}
      {/* 이 div의 w-64는 fixed된 사이드바의 너비와 동일하게 맞춰야 합니다. */}
      <div className="w-64 flex-shrink-0">
        <AdminSidebar />
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}
        <AdminHeader />

        {/* 실제 페이지 콘텐츠 */}
        {/* pt-16: 고정된 헤더 높이(h-16)만큼 상단 패딩을 주어 내용이 헤더 아래로 가지 않게 함 */}
        <main className="flex-1 p-8 pt-24 overflow-y-auto"> {/* ✨ pt-24 (더 여유 있는 패딩) 추가 */}
          {/* ✨ max-w-7xl mx-auto 제거: 자식 컴포넌트가 최대한의 너비를 사용하도록 허용 */}
          {children}
        </main>
      </div>
    </div>
  );
};