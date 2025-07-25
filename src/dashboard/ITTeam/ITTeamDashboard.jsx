import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SideBar from './../../components/Global/SideBar';
import Header from '../../components/Global/Header';
import {
  FiHome,
  FiUsers,
  FiCode,
  FiDatabase,
  FiShield,
  FiSettings,
} from 'react-icons/fi';

const navigationLinks = [
  { to: '/it-team', label: 'Dashboard', icon: <FiHome /> },
  { to: '/it-team/all-users', label: 'User Management', icon: <FiUsers /> },
  { to: '/it-team/system-logs', label: 'System Logs', icon: <FiCode /> },
  { to: '/it-team/database-management', label: 'Database', icon: <FiDatabase /> },
  { to: '/it-team/security-center', label: 'Security Center', icon: <FiShield /> },
  { to: '/it-team/system-settings', label: 'System Settings', icon: <FiSettings /> },
];

const ITTeamDashboard = () => {
  const navigate = useNavigate();
  
  // Get real user information from localStorage
  const userName = localStorage.getItem('full_name') || localStorage.getItem('username') || 'Support Admin';
  const userRole = 'System Administrator';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex h-screen font-sans bg-gray-100">
      <SideBar
        title="IT Team Dashboard"
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
          notificationCount={5}
        />

        <main className="flex-grow p-8 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ITTeamDashboard;