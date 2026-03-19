import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { FiHome, FiThumbsUp, FiFileText, FiAlertCircle, FiDollarSign, FiSend, FiSearch, FiUser } from 'react-icons/fi';
import SideBar from './../../components/Global/SideBar';
import Header from './../../components/Global/Header';

import { useLanguage } from '../../contexts/LanguageContext';

const CollectorDashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const navigationLinks = [
    { to: '/collector-dashboard', label: t.dashboard, icon: <FiHome /> },
    { to: '/collector-dashboard/case-files', label: t.caseFile, icon: <FiFileText /> },
    { to: '/collector-dashboard/escalation-page', label: t.escalationPage, icon: <FiAlertCircle /> },
    { to: '/collector-dashboard/search-page', label: t.searchPage, icon: <FiSearch /> },
    { to: '/collector-dashboard/profile', label: t.profile, icon: <FiUser /> },
  ];
  
  // Get real user information from localStorage
  const userName = localStorage.getItem('full_name') || localStorage.getItem('username') || 'Collector User';
  const userRole = t.districtMagistrate;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex h-screen font-sans">
      <SideBar
        title={t.dmDashboard}
        navigationLinks={navigationLinks}
        userName={userName}
        userRole={userRole}
        onLogout={handleLogout}
      />

      <div className="flex-grow flex flex-col">
        <Header 
          greeting={`Welcome, ${userName}`}
          userName={userName}
          showSearch={true}
          showNotifications={true}
          showSettings={true}
          notificationCount={6}
        />

        <main className="flex-grow p-6 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CollectorDashboard;
