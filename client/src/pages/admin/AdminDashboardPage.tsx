// src/pages/admin/AdminDashboardPage.tsx (최종 버전)
import React from "react";
import { AdminLayout } from "./AdminLayout";
import { UserManagementTable } from "../../components/admin/UserManagementTable"; // 이 컴포넌트를 가져옴

const AdminDashboardPage: React.FC = () => {
  return (
    <AdminLayout>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        회원 목록
      </h2>
      <UserManagementTable /> {/* UserManagementTable을 렌더링 */}
    </AdminLayout>
  );
};

export default AdminDashboardPage;
