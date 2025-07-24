



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

const links = [
  { to: '/sdm-dashboard', label: 'Dashboard', icon: <FiHome /> },
  { to: '/sdm-dashboard/response-from-cmo', label: 'Response From CMO', icon: <FiCornerUpLeft /> },
  { to: '/sdm-dashboard/enquiry-detail-page', label: 'Enquiry Details', icon: <FiFileText /> },
  { to: '/sdm-dashboard/search-page', label: 'Search Page', icon: <FiSearch /> },
  { to: '/sdm-dashboard/profile', label: 'Profile', icon: <FiUser /> },
];

const SDMPanel = () => {
  const navigate = useNavigate();
  
  // Get real user information from localStorage
  const userName = localStorage.getItem('full_name') || localStorage.getItem('username') || 'SDM User';
  const userRole = 'Sub Divisional Magistrate';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex h-screen font-sans">
      <SideBar
        title="SDM Dashboard"
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
