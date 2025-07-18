import React from 'react';
import { Outlet } from 'react-router-dom';
import { FiHome, FiTruck, FiFileText, FiInfo, FiDollarSign, FiActivity, FiUsers, FiBarChart2, FiMessageSquare, FiBell, FiSettings, FiUser, FiList } from 'react-icons/fi';
import { FaHospital } from 'react-icons/fa';
import Sidebar from '../../components/Global/SideBar';
import Header from '../../components/Global/Header';

const links = [
  { to: '/admin', label: 'Dashboard', icon: <FiHome /> },
  { to: '/admin/admin-report-page', label: 'Admin Report', icon: <FiTruck /> },
  { to: '/admin/alert-page', label: 'Alerts', icon: <FiFileText /> },
  { to: '/admin/export-page', label: 'Export Data', icon: <FiInfo /> },
  { to: '/admin/permission-page', label: 'Permissions', icon: <FiDollarSign /> },
  { to: '/admin/system-performance-page', label: 'System Performance', icon: <FiActivity /> },
  { to: '/admin/user-management', label: 'User Management', icon: <FiUsers /> },
  { to: '/admin/enquiry-management', label: 'Enquiry Management', icon: <FiMessageSquare /> },
  { to: '/admin/district-data-page', label: 'District Data', icon: <FiBarChart2 /> },
  { to: '/admin/hospital-management', label: 'Hospital Data', icon: <FaHospital /> },
  { to: '/admin/all-queries', label: 'All Queries', icon: <FiList /> },
];

const AdminDashboard = () => {
  // Get real user information from localStorage
  const userName = localStorage.getItem('full_name') || localStorage.getItem('username') || 'Admin User';
  const userRole = 'Administrator';

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <Sidebar
        navigationLinks={links}
        title="Admin Dashboard"
        className="w-72 bg-white shadow-lg p-6 overflow-y-auto border-r border-gray-200"
        userName={userName}
        userRole={userRole}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col">
        {/* Header */}
        <Header 
          greeting={`Welcome, ${userName}`}
          userName={userName}
          showSearch={true}
          showNotifications={true}
          showSettings={true}
          notificationCount={5}
        >
          
          <button title="Settings" className="p-2 rounded-full hover:bg-blue-700/50 transition">
            <FiSettings className="text-xl" />
          </button>
          <button title="Profile" className="p-2 rounded-full hover:bg-blue-700/50 transition">
            <FiUser className="text-xl" />
          </button>
        </Header>

        {/* Content */}
        <main className="flex-grow p-6 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;