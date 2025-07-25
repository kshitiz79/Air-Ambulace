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
  FiMapPin,
  FiTruck,
  FiFileText,
  FiDollarSign,
  FiActivity,
  FiUpload,
  FiSearch,
  FiAlertTriangle,
  FiClock,
  FiBarChart2
} from 'react-icons/fi';

const navigationLinks = [
  { to: '/it-team', label: 'Dashboard', icon: <FiHome /> },
  
  // User & System Management
  { to: '/it-team/all-users', label: 'User Management', icon: <FiUsers /> },
  { to: '/it-team/system-logs', label: 'System Logs', icon: <FiCode /> },
  { to: '/it-team/database-management', label: 'Database', icon: <FiDatabase /> },
  { to: '/it-team/security-center', label: 'Security Center', icon: <FiShield /> },
  { to: '/it-team/system-settings', label: 'System Settings', icon: <FiSettings /> },
  
  // Data Management
  { to: '/it-team/district-management', label: 'District Management', icon: <FiMapPin /> },
  { to: '/it-team/hospital-management', label: 'Hospital Management', icon: <FiMapPin /> },
  { to: '/it-team/ambulance-management', label: 'Ambulance Fleet', icon: <FiTruck /> },
  
  // Operations Management
  { to: '/it-team/enquiry-management', label: 'All Enquiries', icon: <FiFileText /> },
  { to: '/it-team/flight-assignments', label: 'Flight Assignments', icon: <FiActivity /> },
  { to: '/it-team/invoices-management', label: 'Invoice Management', icon: <FiDollarSign /> },
  { to: '/it-team/case-escalations', label: 'Case Escalations', icon: <FiAlertTriangle /> },
  { to: '/it-team/post-operations', label: 'Post Operations', icon: <FiClock /> },
  
  // Import/Export & Analytics
  { to: '/it-team/data-import-export', label: 'Data Import/Export', icon: <FiUpload /> },
  { to: '/it-team/analytics-reports', label: 'Analytics & Reports', icon: <FiBarChart2 /> },
  { to: '/it-team/advanced-search', label: 'Advanced Search', icon: <FiSearch /> },
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