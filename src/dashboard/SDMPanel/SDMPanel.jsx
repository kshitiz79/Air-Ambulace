



import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SideBar from './../../components/Global/SideBar';

import {
  FiHome,
  FiSend,
  FiUserX,
  FiCornerUpLeft,
  FiFileText,
  FiSearch,
  FiCheckCircle,
  FiBell,
  FiSettings,
  FiUser,
} from 'react-icons/fi';
import Header from '../../components/Global/Header';

const links = [
  { to: '/sdm-dashboard', label: 'Dashboard', icon: <FiHome /> },
  { to: '/sdm-dashboard/forwarding-to-dm', label: 'Forwarding to DM', icon: <FiSend /> },
  { to: '/sdm-dashboard/approval-reject', label: 'Approval / Reject', icon: <FiUserX /> },
  { to: '/sdm-dashboard/query-to-cmo', label: 'Query to CMO', icon: <FiCornerUpLeft /> },
  { to: '/sdm-dashboard/enquiry-detail-page', label: 'Enquiry Details', icon: <FiFileText /> },
  { to: '/sdm-dashboard/search-page', label: 'Search Page', icon: <FiSearch /> },
  { to: '/sdm-dashboard/validation-page', label: 'Validation Page', icon: <FiCheckCircle /> },

];

const SDMPanel = () => {
  const navigate = useNavigate();
  const userName = 'Jane Smith';
  const userRole = 'SDM Officer';

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

export default SDMPanel;
