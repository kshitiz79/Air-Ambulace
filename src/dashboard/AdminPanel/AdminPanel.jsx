import React from 'react';
import { Outlet } from 'react-router-dom';
import { FiHome, FiTruck, FiFileText, FiInfo, FiDollarSign, FiActivity, FiUsers, FiBarChart2 } from 'react-icons/fi';
import { FaHospital } from 'react-icons/fa';
import Sidebar from '../../components/Global/SideBar';

const links = [
  { to: '/admin', label: 'Dashboard', icon: <FiHome /> },
  { to: '/admin/admin-report-page', label: 'Admin Report', icon: <FiTruck /> },
  { to: '/admin/alert-page', label: 'Alerts', icon: <FiFileText /> },
  { to: '/admin/export-page', label: 'Export Data', icon: <FiInfo /> },
  { to: '/admin/permission-page', label: 'Permissions', icon: <FiDollarSign /> },
  { to: '/admin/system-performance-page', label: 'System Performance', icon: <FiActivity /> },
  { to: '/admin/user-management', label: 'User Management', icon: <FiUsers /> },
  { to: '/admin/district-data-page', label: 'District Data', icon: <FiBarChart2 /> },
  { to: '/admin/hospital-management', label: 'Hospital Data', icon: <FaHospital /> },
];

const AdminDashboard = () => {
  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <Sidebar
        links={links}
        title="Admin Dashboard"
        className="w-72 bg-white shadow-lg p-6 overflow-y-auto border-r border-gray-200"
        userName="Admin User"
        userRole="Administrator"
      />

      {/* Content */}
      <main className="flex-grow p-6 bg-gray-50 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;