



import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SideBar from './../../components/Global/SideBar';
import Header from '../../components/Global/Header';
import {
  FiHome,
  FiCornerUpLeft,
  FiFileText,
  FiSearch,
  FiUser,
} from 'react-icons/fi';

import { useLanguage } from '../../contexts/LanguageContext';

const SDMPanel = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const links = [
    { to: '/sdm-dashboard', label: t.dashboard, icon: <FiHome /> },
    { to: '/sdm-dashboard/response-from-cmho', label: t.responseFromCMHO, icon: <FiCornerUpLeft /> },
    { to: '/sdm-dashboard/enquiry-detail-page', label: t.enquiryDetails, icon: <FiFileText /> },
    { to: '/sdm-dashboard/search-page', label: t.searchPage, icon: <FiSearch /> },
    { to: '/sdm-dashboard/profile', label: t.profile, icon: <FiUser /> },
  ];
  
  // Get real user information from localStorage
  const userName = localStorage.getItem('full_name') || localStorage.getItem('username') || 'SDM User';
  const userRole = t.subDivisionalMagistrate;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex h-screen font-sans">
      <SideBar
        title={t.sdmDashboard}
        navigationLinks={links}
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
          notificationCount={3}
        />




        <main className="flex-grow p-6 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SDMPanel;
