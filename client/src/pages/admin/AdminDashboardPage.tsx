// src/pages/admin/AdminDashboardPage.tsx
import React from "react";
import { AdminLayout } from "./AdminLayout";
import { UserManagementTable } from "../../components/admin/UserManagementTable";

const AdminDashboardPage: React.FC = () => {
  return (
    <AdminLayout>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        회원 목록
      </h2>
      <UserManagementTable />
    </AdminLayout>
  );
};

export default AdminDashboardPage;
