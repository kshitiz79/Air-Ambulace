import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { FiHome, FiThumbsUp, FiFileText, FiAlertCircle, FiDollarSign, FiSend, FiSearch } from 'react-icons/fi';
import SideBar from './../../components/Global/SideBar';
import Header from './../../components/Global/Header';

const navigationLinks = [
  { to: '/dm-dashboard', label: 'Dashboard', icon: <FiHome /> },
  { to: '/dm-dashboard/approval-reject', label: 'Approval / Reject', icon: <FiThumbsUp /> },
  { to: '/dm-dashboard/case-files', label: 'Case File', icon: <FiFileText /> },
  { to: '/dm-dashboard/escalation-page', label: 'Escalation Page', icon: <FiAlertCircle /> },
  { to: '/dm-dashboard/financial-page', label: 'Financial Page', icon: <FiDollarSign /> },
  { to: '/dm-dashboard/order-release-page', label: 'Order Release', icon: <FiSend /> },
  { to: '/dm-dashboard/search-page', label: 'Search Page', icon: <FiSearch /> },
];

const DMDashboard = () => {
  const navigate = useNavigate();
  
  // Get real user information from localStorage
  const userName = localStorage.getItem('full_name') || localStorage.getItem('username') || 'DM User';
  const userRole = 'District Magistrate';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex h-screen font-sans">
      <SideBar
        title="DM Dashboard"
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

export default DMDashboard;
