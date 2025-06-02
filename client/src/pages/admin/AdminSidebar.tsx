// TokenWallet/client/src/components/admin/AdminSidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';

export const AdminSidebar: React.FC = () => {
  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white text-black flex flex-col p-6 shadow-lg z-20"> {/* ✨ fixed, top-0, left-0, h-screen, z-20 유지 */}
      <div className="text-2xl font-bold mb-10 text-center">
        어드민 로고
      </div>
      <nav className="flex-1">
        <ul>
          <li className="mb-4">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `flex items-center py-2 px-4 rounded-md transition duration-200 ${
                  isActive ? 'bg-blue-100 text-blue-800' : 'hover:bg-blue-300 text-gray-300'
                }`
              }
            >
              <span className="mr-3">👥</span> 사용자 관리
            </NavLink>
          </li>
          <li className="mb-4">
            <NavLink
              to="/admin/transactions"
              className={({ isActive }) =>
                `flex items-center py-2 px-4 rounded-md transition duration-200 ${
                  isActive ? 'bg-blue-100 text-blue-800' : 'hover:bg-blue-300 text-gray-300'
                }`
              }
            >
              <span className="mr-3">💸</span> 트랜잭션 관리
            </NavLink>
          </li>
          {/* 기타 어드민 메뉴 항목 추가 */}
        </ul>
      </nav>
      <div className="mt-auto text-center text-gray-500 text-sm">
        &copy; 2025 TokenWallet Admin
      </div>
    </aside>
  );
};