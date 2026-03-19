import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { FiHome, FiFileText, FiAlertCircle, FiSearch, FiUser, FiDollarSign, FiSend } from 'react-icons/fi';
import SideBar from '../../components/Global/SideBar';
import Header from '../../components/Global/Header';
import { useLanguage } from '../../contexts/LanguageContext';

const DmePanel = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const navigationLinks = [
    { to: '/dme-dashboard', label: t.dashboard || 'Dashboard', icon: <FiHome /> },
    { to: '/dme-dashboard/case-files', label: t.caseFile || 'Case Files', icon: <FiFileText /> },
    { to: '/dme-dashboard/approval-reject', label: t.approvalRejection || 'Approval/Rejection', icon: <FiFileText /> },
    { to: '/dme-dashboard/escalation-page', label: t.escalationPage || 'Escalations', icon: <FiAlertCircle /> },
    { to: '/dme-dashboard/financial-page', label: t.financialSanctions || 'Financial', icon: <FiDollarSign /> },
    { to: '/dme-dashboard/order-release-page', label: t.orderRelease || 'Order Release', icon: <FiSend /> },
    { to: '/dme-dashboard/search-page', label: t.searchPage || 'Search', icon: <FiSearch /> },
    { to: '/dme-dashboard/profile', label: t.profile || 'Profile', icon: <FiUser /> },
  ];

  const userName = localStorage.getItem('full_name') || localStorage.getItem('username') || 'DME User';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex h-screen font-sans">
      <SideBar
        title="DME Dashboard"
        navigationLinks={navigationLinks}
        userName={userName}
        userRole="Director of Medical Education"
        onLogout={handleLogout}
      />
      <div className="flex-grow flex flex-col">
        <Header
          greeting={`Welcome, ${userName}`}
          userName={userName}
          showSearch={true}
          showNotifications={true}
          showSettings={true}
          notificationCount={0}
        />
        <main className="flex-grow p-6 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DmePanel;
