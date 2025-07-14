import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { FiHome, FiThumbsUp, FiFileText, FiAlertCircle, FiDollarSign, FiSend, FiSearch } from 'react-icons/fi';
import { FiBell, FiSettings, FiUser } from 'react-icons/fi';
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
  const userName = 'DM User';
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
        <Header greeting={`Welcome, ${userName}`}>  
          <button title="Notifications" className="p-2 rounded-full hover:bg-blue-700/50 transition">
            <FiBell className="text-xl" />
          </button>
          <button title="Settings" className="p-2 rounded-full hover:bg-blue-700/50 transition">
            <FiSettings className="text-xl" />
          </button>
          <button title="Profile" className="p-2 rounded-full hover:bg-blue-700/50 transition">
            <FiUser className="text-xl" />
          </button>
        </Header>

        <main className="flex-grow p-6 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DMDashboard;
