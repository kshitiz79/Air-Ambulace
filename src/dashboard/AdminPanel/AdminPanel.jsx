import React from 'react';
import { Outlet } from 'react-router-dom';
import { FiHome, FiTruck, FiFileText, FiInfo, FiDollarSign, FiActivity, FiUsers, FiBarChart2, FiMessageSquare, FiBell, FiSettings, FiUser, FiList } from 'react-icons/fi';
import { FaHospital } from 'react-icons/fa';
import Sidebar from '../../components/Global/SideBar';
import Header from '../../components/Global/Header';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminDashboard = () => {
  const { t } = useLanguage();
  
  const links = [
    { to: '/admin', label: t.dashboard, icon: <FiHome /> },
    { to: '/admin/admin-report-page', label: t.adminReport, icon: <FiTruck /> },
    { to: '/admin/alert-page', label: t.alerts, icon: <FiFileText /> },
    { to: '/admin/export-page', label: t.exportData, icon: <FiInfo /> },
    { to: '/admin/permission-page', label: t.permissions, icon: <FiDollarSign /> },
    { to: '/admin/system-performance-page', label: t.systemPerformance, icon: <FiActivity /> },
    { to: '/admin/user-management', label: t.userManagement, icon: <FiUsers /> },
    { to: '/admin/enquiry-management', label: t.enquiryManagement, icon: <FiMessageSquare /> },
    { to: '/admin/district-data-page', label: t.districtData, icon: <FiBarChart2 /> },
    { to: '/admin/hospital-management', label: t.hospitalData, icon: <FaHospital /> },
    { to: '/admin/all-queries', label: t.allQueries, icon: <FiList /> },
  ];

  // Get real user information from localStorage
  const userName = localStorage.getItem('full_name') || localStorage.getItem('username') || 'Admin User';
  const userRole = t.administrator;

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <Sidebar
        navigationLinks={links}
        title={t.adminDashboard}
        className="w-72 bg-white shadow-sm p-6 overflow-y-auto border-r border-gray-200"
        userName={userName}
        userRole={userRole}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <Header
          greeting={`Welcome, ${userName}`}
          userName={userName}
          showSearch={true}
          showNotifications={true}
          showSettings={true}
          notificationCount={5}
        >

          <button title={t.settings} className="p-2 rounded-full hover:bg-blue-700/50 transition">
            <FiSettings className="text-xl" />
          </button>
          <button title={t.profile} className="p-2 rounded-full hover:bg-blue-700/50 transition">
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